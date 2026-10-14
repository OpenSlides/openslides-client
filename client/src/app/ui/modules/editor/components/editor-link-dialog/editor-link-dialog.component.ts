import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Assignment } from '@app/domain/models/assignments/assignment';
import { Topic } from '@app/domain/models/topics/topic';
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
import { RepoSearchSelectorComponent } from '@app/ui/modules/search-selector/components/repo-search-selector/repo-search-selector.component';
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
    protected internalReferenceForm: UntypedFormGroup;

    /**
     * The selected internal item
     */
    protected item: ViewTopic | ViewMotion | ViewAssignment;

    /**
     * Values selected by radio buttons
     */
    protected internalRadioOptions: FormGroup;
    protected selectedRepoValue = 0;

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
    protected searchSubscriptionConfig: SubscribeToConfig[];
    protected toggleInternalReference: boolean;
    protected toggleExternalReference: boolean;
    protected readonly searchLists = ['Topic', 'Motion', 'Assignment'];
    protected searchRepos;

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
        });

        // Internal reference
        this.internalLink = { ...this.data.link };
        this.internalRadioOptions = this.fb.group({
            options: [0]
        });
        this.internalRadioOptions.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.selectedRepoValue = this.internalRadioOptions.get('options').value;
        });
    }

    public ngOnInit(): void {
        if (!(this.canEmbed = this.embedAllowed())) return;
        this.searchRepos = [this.agendaItemRepo, this.motionItemRepo, this.assignmentItemRepo];
        this.searchSubscriptionConfig = [
            this.subscriptionTopicConfig,
            this.subscriptionMotionConfig,
            this.subscriptionAssignmentConfig
        ];
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
            this.internalReferenceForm.reset();
            this.internalText = ``;
        }
        this.editMode = !this.editMode;
    }

    /**
     * Initializes the form.
     */
    public initForm(externalLink?: FormGroup<any>): void {
        if (externalLink) {
            this.externalControls.forEach(name => this.externalLink.get(name)?.reset());
            return;
        }
        if (!this.internalReferenceForm) {
            this.initInternalReferenceForm();
        }
    }

    private updateSelectedValue(): void {
        const controlName = `${this.searchLists[this.selectedRepoValue]}FormControl`;
        const selectedId = this.internalReferenceForm.get(controlName)?.value;
        const repo = this.searchRepos[this.selectedRepoValue];
        this.item = repo.getViewModel(selectedId);
        const action = this.item ? 'disable' : 'enable';
        this.externalControls.forEach(name => {
            this.externalLink.get(name)?.[action]();
        });
    }

    private initInternalReferenceForm(): void {
        const disabled = !!this.externalUrl;
        this.internalReferenceForm = new FormGroup({
            TopicFormControl: new FormControl({
                value: this.agendaItemRepo,
                disabled
            }),
            MotionFormControl: new FormControl({
                value: this.motionItemRepo,
                disabled
            }),
            AssignmentFormControl: new FormControl({
                value: this.assignmentItemRepo,
                disabled
            })
        });
        this.internalReferenceForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.updateSelectedValue();
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
