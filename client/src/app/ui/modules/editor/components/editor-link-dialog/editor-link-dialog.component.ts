import { Component, Inject, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AgendaItemRepositoryService } from 'src/app/gateways/repositories/agenda';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { getAgendaListMinimalSubscriptionConfig } from 'src/app/site/pages/meetings/pages/agenda/agenda.subscription';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda/view-models';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments/view-models/view-assignment';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions/view-models/view-motion';
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

    public toggleInternalReference: boolean;
    public toggleExternalReference: boolean;

    private activeMeetingIdService = inject(ActiveMeetingIdService);
    public subscriptionConfig: SubscribeToConfig = getAgendaListMinimalSubscriptionConfig(
        this.activeMeetingIdService.meetingId
    );

    /**
     * Initial value of the input-field.
     */
    @Input()
    public searchFieldInput!: string;

    /**
     * Boolean to decide, whether to open the extension-input and search-list.
     */
    public editMode = false;

    /**
     * Model for the input-field.
     */
    public inputControl;

    /**
     * Init Repos
     */
    public agendaItemRepo = inject(AgendaItemRepositoryService);
    public motionItemRepo = inject(MotionRepositoryService);
    public assignmentItemRepo = inject(AssignmentRepositoryService);
    /**
     * Define lists
     */
    protected agendaItemList: Observable<ViewAgendaItem<any>[]>;
    protected motionItemList: Observable<ViewMotion[]>;
    protected assignmentItemList: Observable<ViewAssignment[]>;

    public searchLists;
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
    public externalDisplayMode: string;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditorLinkDialogInput,
        private dialogRef: MatDialogRef<EditorLinkDialogComponent>,
        private router: Router,
        private fb: FormBuilder,
        private translate: TranslateService
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
            this.externalDisplayMode = this.externalLink.get('extDisplayMode').value;
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
        this.agendaItemList = this.agendaItemRepo.getSortedViewModelListObservable();
        this.motionItemList = this.motionItemRepo.getSortedViewModelListObservable();
        this.assignmentItemList = this.assignmentItemRepo.getSortedViewModelListObservable();

        this.searchLists = [
            { observable: this.agendaItemList, label: this.translate.instant('Topic') },
            { observable: this.motionItemList, label: this.translate.instant('Motion') },
            { observable: this.assignmentItemList, label: this.translate.instant('Assignment') }
        ];
        this.searchRepos = [this.agendaItemRepo, this.motionItemRepo, this.assignmentItemRepo];
        this.initInput();
        this.initForm();
    }

    public removeLink(): void {
        this.dialogRef.close({ action: `remove-link` });
    }

    public cancel(): void {
        this.dialogRef.close({ action: `cancel` });
    }

    public save(): void {
        if (this.externalUrl) {
            if (!/^[a-zA-Z]+:\/\//.test(this.link.href)) {
                this.link.href = this.externalUrl.includes(`http`) ? this.externalUrl : `http://` + this.externalUrl;
            }
            if (this.data.needsText) {
                this.dialogRef.close({ action: `set-link`, link: this.link, text: this.externalText || this.link });
            } else {
                this.dialogRef.close({ action: `set-link`, link: this.link });
            }
        } else {
            this.changeEditMode(true);
            if (!/^[a-zA-Z]+:\/\//.test(this.internalLink.href)) {
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
            this.initInput();
            this.internalText = ``;
        }
        this.editMode = !this.editMode;
    }

    /**
     * Initialize the value of the input.
     */
    public initInput(): void {
        this.inputControl = this.searchFieldInput;
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
            const controlName = `${this.searchLists[this.selectedRepoValue].label}FormControl`;
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
        const parts = item.content_object_id?.split('/');
        const isAgendaItem = item.collection === 'agenda_item' && item.content_object_id?.split('/')[0] === 'topic';
        const setCollection: string = isAgendaItem
            ? 'agenda/topic'
            : item.collection === 'agenda_item'
              ? parts?.[0]
              : item.collection;
        const setId: number = isAgendaItem
            ? item.content_object.sequential_number
            : item.content_object_id
              ? parts?.[1]
              : item.sequential_number;
        const builtUrl = `${this.activeMeetingIdService.meetingId}/${setCollection}s/${setId}`;
        const url = this.router.url.replace(/^\/.*$/, `/${builtUrl}`);
        return url;
    }
}
