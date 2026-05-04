import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { TopicRepositoryService } from 'src/app/gateways/repositories/topics/topic-repository.service';
import { getAgendaListMinimalSubscriptionConfig } from 'src/app/site/pages/meetings/pages/agenda/agenda.subscription';
import { getAssignmentListMinimalSubscriptionConfig } from 'src/app/site/pages/meetings/pages/assignments/assignments.subscription';
import { getMotionListMinimalSubscriptionConfig } from 'src/app/site/pages/meetings/pages/motions/motions.subscription';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { SubscribeToConfig } from 'src/app/site/services/model-request.service';

interface EditorLinkDialogInput {
    link?: { href: string; target?: string };
    needsText?: boolean;
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
    standalone: false
})
export class EditorLinkDialogComponent implements OnInit {
    public isUpdate: boolean;

    public link: { href: string; target?: string };
    public text = ``;

    public internalLink: { href: string; target?: string };
    public internalText = ``;

    public canEmbed: boolean;

    public toggleInternalReference: boolean;
    public toggleExternalReference: boolean;

    // Subscriptions config
    public searchSubscriptionConfig;
    private activeMeetingIdService = inject(ActiveMeetingIdService);
    public subscriptionTopicConfig: SubscribeToConfig;
    public subscriptionMotionConfig: SubscribeToConfig;
    public subscriptionAssignmentConfig: SubscribeToConfig;

    /**
     * Boolean to decide, whether to open the extension-input and search-list.
     */
    public editMode = false;

    /**
     * Init Repos
     */
    public agendaItemRepo = inject(TopicRepositoryService);
    public motionItemRepo = inject(MotionRepositoryService);
    public assignmentItemRepo = inject(AssignmentRepositoryService);

    public searchLists = ['Topic', 'Motion', 'Assignment'];
    public searchRepos;

    /**
     * FormGroup for the search-list.
     */
    public internalReferenceForm: UntypedFormGroup;

    /**
     * The selected internal item
     */
    public item;

    /**
     * Values selected by radio buttons
     */
    public internalRadioOptions: FormGroup;
    public selectedRepoValue = 0;

    /**
     * Values for external link
     */
    public externalLink: FormGroup;
    public externalUrl: string;
    public externalText: string;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditorLinkDialogInput,
        private dialogRef: MatDialogRef<EditorLinkDialogComponent>,
        private router: Router,
        private fb: FormBuilder,
        public translate: TranslateService
    ) {
        // External reference
        this.link = { ...data.link };
        this.isUpdate = !!data.link && !!data.link.href;
        if (!this.link.target) {
            this.link.target = `_self`;
        }
        this.externalLink = this.fb.group({
            extUrl: new FormControl(),
            extText: new FormControl(),
            extDisplayMode: new FormControl()
        });
        this.externalLink.valueChanges.subscribe(() => {
            this.externalUrl = this.externalLink.get('extUrl').value;
            this.externalText = this.externalLink.get('extText').value;
            this.link.target = this.externalLink.get('extDisplayMode').value;
        });

        // Internal reference
        this.internalLink = { ...data.link };
        if (!this.internalLink.target) {
            this.internalLink.target = `_blank`;
        }
        this.internalRadioOptions = this.fb.group({
            options: [0]
        });
        this.internalRadioOptions.valueChanges.subscribe(() => {
            this.selectedRepoValue = this.internalRadioOptions.get('options').value;
        });
    }

    public ngOnInit(): void {
        if ((this.canEmbed = !this.router.url.includes('motions') ? true : false)) {
            this.searchRepos = [this.agendaItemRepo, this.motionItemRepo, this.assignmentItemRepo];
            this.searchSubscriptionConfig = [
                (this.subscriptionTopicConfig = getAgendaListMinimalSubscriptionConfig(
                    this.activeMeetingIdService.meetingId
                )),
                (this.subscriptionMotionConfig = getMotionListMinimalSubscriptionConfig(
                    this.activeMeetingIdService.meetingId
                )),
                (this.subscriptionAssignmentConfig = getAssignmentListMinimalSubscriptionConfig(
                    this.activeMeetingIdService.meetingId
                ))
            ];
            this.initForm();
        }
    }

    public removeLink(): void {
        this.dialogRef.close({ action: `remove-link` });
    }

    public cancel(): void {
        this.dialogRef.close({ action: `cancel` });
    }

    public save(): void {
        if (this.externalUrl) {
            this.link.href = !/^[a-zA-Z]+:\/\//.test(this.externalUrl)
                ? `http://` + this.externalUrl
                : this.externalUrl;
            if (this.data.needsText) {
                this.dialogRef.close({
                    action: `set-link`,
                    link: this.link,
                    text: this.externalText || this.link.href
                });
            } else {
                this.dialogRef.close({ action: `set-link`, link: this.link });
            }
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
            this.initForm();
            this.internalText = ``;
        }
        this.editMode = !this.editMode;
    }

    /**
     * Initializes the form.
     */
    public initForm(): void {
        this.internalReferenceForm = new FormGroup({
            TopicFormControl: new FormControl(this.agendaItemRepo),
            MotionFormControl: new FormControl(this.motionItemRepo),
            AssignmentFormControl: new FormControl(this.assignmentItemRepo)
        });
        this.internalReferenceForm.valueChanges.subscribe(() => {
            const controlName = `${this.searchLists[this.selectedRepoValue]}FormControl`;
            const selectedId = this.internalReferenceForm.get(controlName)?.value;
            const repo = this.searchRepos[this.selectedRepoValue];
            this.item = repo.getViewModel(selectedId);
            const action = this.item ? 'disable' : 'enable';
            ['extUrl', 'extText', 'extDisplayMode'].forEach(name => this.externalLink.get(name)?.[action]());

            this.addReference();
        });
    }

    /**
     * Function to add the values.
     */
    public addReference(): void {
        this.internalText = this.item ? `${this.item.getTitle()}` : '';
        this.internalLink.href = this.item ? this.urlBuilder(this.item) : '';
    }

    public urlBuilder(item): string {
        const setCollection: string = item.collection === 'topic' ? 'agenda/topic' : item.collection;
        const setId: number = item.collection === 'assignment' ? item.id : item.sequential_number;
        const builtUrl = `${this.activeMeetingIdService.meetingId}/${setCollection}s/${setId}`;
        const url = this.router.url.replace(/^\/.*$/, `/${builtUrl}`);
        return url;
    }
}
