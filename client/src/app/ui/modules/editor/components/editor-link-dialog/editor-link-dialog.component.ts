import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AssignmentRepositoryService } from '@app/gateways/repositories/assignments/assignment-repository.service';
import { MotionRepositoryService } from '@app/gateways/repositories/motions/motion-repository.service';
import { TopicRepositoryService } from '@app/gateways/repositories/topics/topic-repository.service';
import { ViewTopic } from '@app/site/pages/meetings/pages/agenda';
import { getAgendaListMinimalSubscriptionConfig } from '@app/site/pages/meetings/pages/agenda/agenda.subscription';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
import { getAssignmentListMinimalSubscriptionConfig } from '@app/site/pages/meetings/pages/assignments/assignments.subscription';
import { ViewMotion } from '@app/site/pages/meetings/pages/motions';
import { getMotionListMinimalSubscriptionConfig } from '@app/site/pages/meetings/pages/motions/motions.subscription';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { SubscribeToConfig } from '@app/site/services/model-request.service';
import { TranslateService } from '@ngx-translate/core';

interface EditorLinkDialogInput {
    link?: { href: string; target?: string };
    needsText?: boolean;
    isModerationNote?: boolean;
}

export interface EditorLinkDialogOutput {
    action: `remove-link` | `cancel` | `set-link`;
    link?: { href: string; target?: string };
    text?: string;
}

@Component({
    selector: `os-editor-link-dialog`,
    templateUrl: `./editor-link-dialog.component.html`,
    styleUrls: [`editor-link-dialog.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class EditorLinkDialogComponent implements OnInit {
    protected translate = inject(TranslateService);
    protected data = inject<EditorLinkDialogInput>(MAT_DIALOG_DATA);
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private agendaItemRepo = inject(TopicRepositoryService);
    private motionItemRepo = inject(MotionRepositoryService);
    private assignmentItemRepo = inject(AssignmentRepositoryService);
    private activeMeetingIdService = inject(ActiveMeetingIdService);
    private dialogRef = inject(MatDialogRef<EditorLinkDialogComponent>);

    public isUpdate: boolean;
    public link: { href: string; target?: string };
    public text = ``;

    /**
     * FormGroup for the search-list.
     */
    protected internalReferenceSelector: UntypedFormGroup;

    /**
     * The selected internal item
     */
    protected item: ViewTopic | ViewMotion | ViewAssignment;

    /**
     * Values selected by radio buttons
     */
    protected internalRadioOptions: FormGroup;
    protected selectedRepoName = 'Topics';

    /**
     * Values for external link
     */
    protected externalLink = this.fb.group({
        extUrl: this.fb.control(''),
        extText: this.fb.control(''),
        extDisplayMode: this.fb.control<'_self' | '_blank'>('_self')
    });

    protected externalUrl: string;
    protected externalText: string;
    protected canEmbed: boolean;
    protected toggleInternalReference: boolean;
    protected toggleExternalReference: boolean;
    protected searchSubscriptionConfig: Record<string, SubscribeToConfig>;
    protected searchRepos: Record<string, typeof this.repo>;
    protected repo;

    /**
     * Boolean to decide, whether to open the extension-input and search-list.
     */
    private editMode = false;

    private readonly externalControls = ['extUrl', 'extText', 'extDisplayMode'];
    private readonly meetingId = this.activeMeetingIdService.meetingId;
    private internalLink: { href: string; target?: string };
    private internalText = ``;
    private subscriptionTopicConfig: SubscribeToConfig = getAgendaListMinimalSubscriptionConfig(this.meetingId);
    private subscriptionMotionConfig: SubscribeToConfig = getMotionListMinimalSubscriptionConfig(this.meetingId);
    private subscriptionAssignmentConfig: SubscribeToConfig = getAssignmentListMinimalSubscriptionConfig(
        this.meetingId
    );

    public constructor() {
        // External reference
        this.link = { ...this.data.link };
        this.isUpdate = !!this.data.link && !!this.data.link.href;
        if (!this.link.target) {
            this.link.target = `_self`;
        }
        this.externalLink.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            const { extUrl, extText, extDisplayMode } = this.externalLink.getRawValue();
            this.externalUrl = extUrl;
            this.externalText = extText;
            this.link.target = extDisplayMode;
            this.updateDisabledState();
        });
        // Internal reference
        if (!(this.canEmbed = this.embedAllowed())) return;
        this.internalLink = { ...this.data.link };
        this.internalRadioOptions = this.fb.group({
            options: this.fb.control('Topics')
        });
        this.internalRadioOptions
            .get('options')
            ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
                this.selectedRepoName = value;
                this.repo = this.searchRepos[this.selectedRepoName];
            });
    }

    private updateDisabledState(): void {
        const disabled = !!this.externalUrl;
        const optionsControl = this.internalRadioOptions.get('options');
        const referenceControl = this.internalReferenceSelector.get(this.selectedRepoName + 'FormControl');

        optionsControl?.[disabled ? 'disable' : 'enable']({ emitEvent: false });
        referenceControl?.[disabled ? 'disable' : 'enable']({ emitEvent: false });
    }

    public ngOnInit(): void {
        if (!this.canEmbed) return;
        this.searchRepos = {
            Topics: this.agendaItemRepo,
            Motions: this.motionItemRepo,
            Assignments: this.assignmentItemRepo
        };
        this.searchSubscriptionConfig = {
            Topics: this.subscriptionTopicConfig,
            Motions: this.subscriptionMotionConfig,
            Assignments: this.subscriptionAssignmentConfig
        };
        this.initForm();
    }

    private embedAllowed(): boolean {
        return (
            (this.router.url === `/${this.meetingId}` || this.router.url.includes('agenda/topics')) &&
            this.data.isModerationNote
        );
    }

    public removeLink(): void {
        this.dialogRef.close({ action: `remove-link` });
    }

    public cancel(): void {
        this.dialogRef.close({ action: `cancel` });
    }

    public save(): void {
        const { extUrl, extText } = this.externalLink.getRawValue();
        if (extUrl?.trim()) {
            this.link.href = this.normalizeExternalUrl(extUrl);
            this.internalLink.target = `_blank`;
            if (this.data.needsText) {
                this.dialogRef.close({
                    action: `set-link`,
                    link: this.link,
                    text: extText || this.link.href
                });
            } else {
                this.dialogRef.close({ action: `set-link`, link: this.link });
            }
            return;
        } else {
            this.changeEditMode(true);
            if (this.internalLink.href) {
                this.dialogRef.close({
                    action: `set-link`,
                    text: this.internalText,
                    link: this.internalLink
                });
            }
        }
    }

    private normalizeExternalUrl(externalUrl): string {
        return !/^[a-zA-Z]+:\/\//.test(externalUrl) ? `http://` + externalUrl : externalUrl;
    }

    public toggleArrow(prop: 'toggleInternalReference' | 'toggleExternalReference'): void {
        this[prop] = !this[prop];
    }

    /**
     * Function to switch to or from editing-mode.
     *
     * @param save Boolean, whether the changes should be saved or resetted.
     */
    public changeEditMode(save = false): void {
        if (save) {
            this.addReference();
        } else {
            this.internalReferenceSelector.reset();
            this.internalText = ``;
        }
        this.editMode = !this.editMode;
    }

    /**
     * Initializes the form.
     */
    protected initForm(externalLink?: FormGroup<any>): void {
        if (externalLink) {
            this.externalControls.forEach(name => this.externalLink.get(name)?.reset());
            return;
        }
        if (!this.internalReferenceSelector) {
            this.initInternalReferenceForm();
        }
    }

    private disableExternalLinkFields(): void {
        const selectedId = this.internalReferenceSelector.get(this.selectedRepoName + 'FormControl')?.value;
        const repo = this.searchRepos[this.selectedRepoName];
        this.item = repo.getViewModel(selectedId);
        const action = this.item ? 'disable' : 'enable';
        this.externalControls.forEach(name => {
            this.externalLink.get(name)?.[action]();
        });
    }

    private initInternalReferenceForm(): void {
        this.internalReferenceSelector = new FormGroup({
            TopicsFormControl: new FormControl({
                value: this.agendaItemRepo,
                disabled: !!this.externalUrl
            }),
            MotionsFormControl: new FormControl({
                value: this.motionItemRepo,
                disabled: !!this.externalUrl
            }),
            AssignmentsFormControl: new FormControl({
                value: this.assignmentItemRepo,
                disabled: !!this.externalUrl
            })
        });
        this.internalReferenceSelector.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.disableExternalLinkFields();
            this.addReference();
        });
    }

    /**
     * Function to add the values.
     */
    private addReference(): void {
        this.internalText = this.item ? `${this.item.getTitle()}` : '';
        this.internalLink.href = this.item ? this.urlBuilder(this.item) : '';
    }

    private urlBuilder(item): string {
        const collection = item.collection === 'topic' ? 'agenda/topics' : `${item.collection}s`;
        const id = item.collection === 'assignment' ? item.id : item.sequential_number;
        return `/${this.meetingId}/${collection}/${id}`;
    }
}
