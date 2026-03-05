import { ChangeDetectorRef, Component, EventEmitter, Inject, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { AgendaItemRepositoryService } from 'src/app/gateways/repositories/agenda';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { getAgendaListMinimalSubscriptionConfig } from 'src/app/site/pages/meetings/pages/agenda/agenda.subscription';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda/view-models';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments/view-models/view-assignment';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions/view-models/view-motion';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { SubscribeToConfig } from 'src/app/site/services/model-request.service';
import { ViewModelListProvider } from 'src/app/ui/base/view-model-list-provider';

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

    public toggleInsert: boolean;

    private _repo!: ViewModelListProvider<any>;

    protected subscriptions: Subscription[] = [];
    @Input()
    public set repo(repo: ViewModelListProvider<any>) {
        this._repo = repo;
    }

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
     * Optional label for the input.
     */
    @Input()
    public extensionLabel!: string;

    /**
     * Title for this component.
     */
    @Input()
    public title!: string;

    /**
     * Boolean, whether the input and the search-list can be changed.
     */
    @Input()
    public canBeEdited = true;

    /**
     * EventEmitter, when clicking on the 'save'-button.
     */
    @Output()
    public succeeded = new EventEmitter<string>();

    /**
     * Boolean to decide, whether to open the extension-input and search-list.
     */
    public editMode = false;

    /**
     * The index of the search list that was last selected from, or -1 if something was written in
     * the input field afterwards.
     */
    private searchListLastSelected = -1;

    /**
     * Model for the input-field.
     */
    public inputControl;

    /**
     * Prevent selecting the same value twice.
     */
    private searchListDisabledItems = [];

    private cd: ChangeDetectorRef;

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

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditorLinkDialogInput,
        private dialogRef: MatDialogRef<EditorLinkDialogComponent>
    ) {
        this.link = data.link;
        this.isUpdate = !!data.link && !!data.link.href;
        if (!this.link.target) {
            this.link.target = `_self`;
        }
        this.referenceLink = data.link;
        this.referenceLink.target = `_self`;
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
        if (this.link.href && !/^[a-zA-Z]+:\/\//.test(this.link.href)) {
            this.link.href = `http://` + this.link.href;
        }
        console.log(this.link.href);
        if (this.data.needsText) {
            // this.dialogRef.close({ action: `set-link`, link: this.link, text: this.text || this.link });
        } else {
            // this.dialogRef.close({ action: `set-link`, link: this.link });
        }
    }

    public toggle(): void {
        this.toggleInsert = !this.toggleInsert;
    }

    public inputChanged(): void {
        this.searchListLastSelected = -1;
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
            this.addToExtensionField();
        } else {
            this.initForm();
            this.initInput();
        }
        this.editMode = !this.editMode;
    }

    /**
     * Initialize the value of the input.
     */
    public initInput(): void {
        this.inputControl = this.searchFieldInput;
        this.searchListDisabledItems = [];
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
    }

    /**
     * Function to execute, to add the values.
     */
    public addToExtensionField(): void {
        const controlName = `${this.searchLists[this.selectedRepoValue].label}FormControl`;
        const selectedId: number = this.extensionFieldForm.get(controlName)?.value;
        const repo = this.searchRepos[this.selectedRepoValue];
        const item = repo.getViewModel(selectedId);
        console.log(item);
        // this.referenceText =
        this.getTitle(item);
        if (!this.getIsDisabled(item)) {
            this.inputControl = `[${item.fqid}]`;
            this.disableItem(item);
            this.getIsDisabled(item);
        }
    }

    public getIsDisabled(item): boolean {
        console.log('IS DISABLED?', this.searchListDisabledItems?.includes(item.fqid));
        return this.searchListDisabledItems?.includes(item.fqid);
    }

    public disableItem(item): void {
        if (!this.getIsDisabled(item.fqid)) this.searchListDisabledItems = [item.fqid];
        console.log(this.searchListDisabledItems);
    }

    public getTitle(item): void {
        console.log(item.content_object_id, item.collection, item.id);
    }

    public sendSuccess(): void {
        this.succeeded.emit(this.inputControl);
    }
}
