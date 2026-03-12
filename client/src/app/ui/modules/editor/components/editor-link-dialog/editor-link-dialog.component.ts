import { Component, Inject, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
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

    public referenceLink: { href: string; target?: string };

    public referenceText = ``;

    public toggleInternalReference: boolean;
    public toggleExternalReference: boolean;

    /**
     * Values selected by radio buttons
     */
    public selectedRepoValue = 0;

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
     * The item from the list that will be added to the editor.
     */
    public itemToReference;
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
    public extensionFieldForm: UntypedFormGroup;

    /**
     * The selected internal item
     */
    public item;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditorLinkDialogInput,
        private dialogRef: MatDialogRef<EditorLinkDialogComponent>,
        private router: Router
    ) {
        this.link = { ...data.link };
        this.isUpdate = !!data.link && !!data.link.href;
        if (!this.link.target) {
            this.link.target = `_self`;
        }
        this.referenceLink = { ...data.link };
        if (!this.referenceLink.target) {
            this.referenceLink.target = `_blank`;
        }
    }

    public ngOnInit(): void {
        this.agendaItemList = this.agendaItemRepo.getSortedViewModelListObservable();
        this.motionItemList = this.motionItemRepo.getSortedViewModelListObservable();
        this.assignmentItemList = this.assignmentItemRepo.getSortedViewModelListObservable();

        this.searchLists = [
            { observable: this.agendaItemList, label: 'Topic' },
            { observable: this.motionItemList, label: 'Motion' },
            { observable: this.assignmentItemList, label: 'Assignment' }
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
        if (this.link.href) {
            if (!/^[a-zA-Z]+:\/\//.test(this.link.href)) {
                this.link.href = `http://` + this.link.href;
            }
            if (this.data.needsText) {
                this.dialogRef.close({ action: `set-link`, link: this.link, text: this.text || this.link });
            } else {
                this.dialogRef.close({ action: `set-link`, link: this.link });
            }
        } else {
            this.changeEditMode(true);
            if (!/^[a-zA-Z]+:\/\//.test(this.referenceLink.href)) {
                this.dialogRef.close({
                    action: `set-link`,
                    text: this.referenceText,
                    link: this.referenceLink
                });
            }
        }
    }

    public toggleArrow(prop: 'toggleInternalReference' | 'toggleExternalReference'): void {
        this[prop] = !this[prop];
    }

    /**
     * Hitting enter on the input field should save the content
     */
    public keyDownFunction(event: any): void {
        if (event.key === `Enter`) {
            this.changeEditMode(true);
        }
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
            this.referenceText = ``;
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
        this.extensionFieldForm = new FormGroup({
            TopicFormControl: new FormControl(this.agendaItemRepo),
            MotionFormControl: new FormControl(this.motionItemRepo),
            AssignmentFormControl: new FormControl(this.assignmentItemRepo)
        });
        this.extensionFieldForm.valueChanges.subscribe(() => {
            const controlName = `${this.searchLists[this.selectedRepoValue].label}FormControl`;
            const selectedId = this.extensionFieldForm.get(controlName)?.value;
            const repo = this.searchRepos[this.selectedRepoValue];
            this.item = repo.getViewModel(selectedId);
            this.addReference();
        });
    }

    /**
     * Function to add the values.
     */
    public addReference(): void {
        this.referenceText = this.item ? `${this.item.getTitle()}` : '';
        this.referenceLink.href = this.item ? this.urlBuilder(this.item) : '';
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
