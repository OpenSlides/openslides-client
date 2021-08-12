import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PblColumnDefinition } from '@pebula/ngrid';
import { BehaviorSubject } from 'rxjs';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SPEAKER_BUTTON_FOLLOW } from 'app/shared/components/speaker-button/speaker-button.component';
import { AgendaItemType } from 'app/shared/models/agenda/agenda-item';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { ViewMotionBlock } from 'app/site/motions/models/view-motion-block';
import { MotionBlockSortService } from 'app/site/motions/services/motion-block-sort.service';

/**
 * Table for the motion blocks
 */
@Component({
    selector: 'os-motion-block-list',
    templateUrl: './motion-block-list.component.html',
    styleUrls: ['./motion-block-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MotionBlockListComponent extends BaseListViewComponent<ViewMotionBlock> implements OnInit {
    @ViewChild('newMotionBlockDialog', { static: true })
    private newMotionBlockDialog: TemplateRef<string>;

    private dialogRef: MatDialogRef<any>;

    /**
     * Holds the create form
     */
    public createBlockForm: FormGroup;

    /**
     * Holds the agenda items to select the parent item
     */
    public items: BehaviorSubject<ViewAgendaItem[]>;

    /**
     * Determine the default agenda visibility
     */
    public defaultVisibility = AgendaItemType.internal;

    /**
     * Defines the properties the `sort-filter-bar` can search for.
     */
    public filterProps = ['title'];

    /**
     * helper for permission checks
     *
     * @returns true if the user may alter motions or their metadata
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.motionCanManage, Permission.motionCanManageMetadata);
    }

    /**
     * Define the columns to show
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'title',
            label: this.translate.instant('Title'),
            width: '100%'
        },
        {
            prop: 'amount',
            label: this.translate.instant('Motions'),
            width: '40px'
        }
    ];

    /**
     * Constructor for the motion block list view
     *
     * @param titleService sets the title
     * @param translate translpations
     * @param matSnackBar display errors in the snack bar
     * @param route determine the local route
     * @param storage
     * @param repo the motion block repository
     * @param formBuilder creates forms
     * @param promptService the delete prompt
     * @param itemRepo
     * @param operator permission checks
     * @param sortService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private activeMeetingIdService: ActiveMeetingIdService,
        public repo: MotionBlockRepositoryService,
        private formBuilder: FormBuilder,
        private itemRepo: AgendaItemRepositoryService,
        private operator: OperatorService,
        private dialog: MatDialog,
        public sortService: MotionBlockSortService
    ) {
        super(componentServiceCollector);

        this.createBlockForm = this.formBuilder.group({
            title: ['', Validators.required],
            agenda_create: [''],
            agenda_parent_id: [],
            agenda_type: [''],
            internal: [false]
        });
    }

    /**
     * Observe the agendaItems for changes.
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle('Motion blocks');
        this.items = this.itemRepo.getViewModelListBehaviorSubject();
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingIdService.meetingId],
            follow: [
                {
                    idField: 'motion_block_ids',
                    follow: [
                        {
                            idField: 'motion_ids',
                            // since effectively we do not need any info here
                            fieldset: [],
                            follow: [
                                {
                                    idField: 'state_id',
                                    fieldset: 'hasNextState'
                                }
                            ]
                        },
                        SPEAKER_BUTTON_FOLLOW
                    ]
                }
            ]
        };
    }

    /**
     * Helper function reset the form and set the default values
     */
    private resetForm(): void {
        this.createBlockForm.reset();
        this.createBlockForm.get('agenda_type').setValue(this.defaultVisibility);
    }

    /**
     * Click handler for the plus button.
     * Opens the dialog for motion block creation.
     */
    public onPlusButton(): void {
        this.resetForm();
        this.dialogRef = this.dialog.open(this.newMotionBlockDialog, infoDialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    /**
     * Sends the block to create to the repository and resets the form.
     */
    private save(): void {
        if (this.createBlockForm.valid) {
            this.repo.create(this.createBlockForm.value);
            this.resetForm();
        }
    }

    /**
     * clicking Shift and Enter will save automatically
     * clicking Escape will cancel the process
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && event.shiftKey) {
            this.save();
            this.dialogRef.close();
        }
        if (event.key === 'Escape') {
            this.resetForm();
            this.dialogRef.close();
        }
    }

    public getMotionAmount(block: ViewMotionBlock): number {
        return block.motions.length;
    }

    public getIndicatingIcon(block: ViewMotionBlock): string | null {
        if (block.isFinished) {
            return 'check';
        } else if (block.internal) {
            return 'lock';
        } else {
            return null;
        }
    }

    public getIndicatingTooltip(block: ViewMotionBlock): string {
        if (block.isFinished) {
            return 'Finished';
        } else if (block.internal) {
            return 'Internal';
        } else {
            return '';
        }
    }
}
