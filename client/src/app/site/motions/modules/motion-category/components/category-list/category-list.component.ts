import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PblColumnDefinition } from '@pebula/ngrid';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';

/**
 * Table for categories
 */
@Component({
    selector: 'os-category-list',
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent extends BaseListViewComponent<ViewMotionCategory> implements OnInit {
    @ViewChild('newCategoryDialog', { static: true })
    private newCategoryDialog: TemplateRef<string>;

    private dialogRef: MatDialogRef<any>;

    /**
     * Holds the create form
     */
    public createForm: FormGroup;

    /**
     * Define the columns to show
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'title',
            width: 'auto'
        },
        {
            prop: 'amount',
            width: this.singleButtonWidth
        }
    ];

    /**
     * Define extra filter properties
     */
    public filterProps = ['prefixedName'];

    /**
     * helper for permission checks
     *
     * @returns true if the user may alter motions or their metadata
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.motionsCanManage);
    }

    /**
     * The usual component constructor
     * @param titleService
     * @param translate
     * @param matSnackBar
     * @param route
     * @param storage
     * @param repo
     * @param formBuilder
     * @param operator
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public repo: MotionCategoryRepositoryService,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private operator: OperatorService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(componentServiceCollector);

        this.createForm = this.formBuilder.group({
            prefix: [''],
            name: ['', Validators.required],
            parent_id: ['']
        });
    }

    /**
     * Observe the agendaItems for changes.
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle('Categories');
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingIdService.meetingId],
            follow: [
                {
                    idField: 'motion_category_ids',
                    fieldset: 'list'
                }
            ]
        };
    }

    public getMotionAmount(category: ViewMotionCategory): number {
        return category.motion_ids?.length || 0;
    }

    /**
     * Click handler for the plus button
     */
    public onPlusButton(): void {
        this.createForm.reset();
        this.dialogRef = this.dialog.open(this.newCategoryDialog, infoDialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    /**
     * Sends the category to create to the repository.
     */
    private save(): void {
        if (this.createForm.valid) {
            this.repo.create(this.createForm.value);
        }
    }

    /**
     * clicking Enter will save automatically
     * clicking Escape will cancel the process
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.save();
            this.dialogRef.close();
        }
        if (event.key === 'Escape') {
            this.dialogRef.close();
        }
    }

    public getMargin(category: ViewMotionCategory): string {
        return `${category.level * 20}px`;
    }
}
