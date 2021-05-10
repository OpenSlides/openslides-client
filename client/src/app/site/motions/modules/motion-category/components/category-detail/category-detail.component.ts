import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionService } from 'app/core/repositories/motions/motion.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';

/**
 * Detail component to display one motion block
 */
@Component({
    selector: 'os-category-detail',
    templateUrl: './category-detail.component.html',
    styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent extends BaseModelContextComponent implements OnInit {
    /**
     * The one selected category
     */
    public selectedCategory: ViewMotionCategory;

    /**
     * All categories with the selected one and all children.
     */
    public categories: ViewMotionCategory[];

    /**
     * Datasources for `categories`. Holds all motions for one category.
     */
    public readonly dataSources: { [id: number]: MatTableDataSource<ViewMotion> } = {};

    /**
     * The form to edit the selected category
     */
    @ViewChild('editForm', { static: true })
    public editForm: FormGroup;

    /**
     * Reference to the template for edit-dialog
     */
    @ViewChild('editDialog', { static: true })
    private editDialog: TemplateRef<string>;

    private dialogRef: MatDialogRef<any>;

    /**
     * helper for permission checks
     *
     * @returns true if the user may alter motions
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.motionsCanManage);
    }

    /**
     * Constructor for motion block details
     * @param route determine the blocks ID by the route
     * @param operator the current user
     * @param router navigating
     * @param repo the motion blocks repository
     * @param motionRepo the motion repository
     * @param promptService the displaying prompts before deleting
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private activeMeetingIdService: ActiveMeetingIdService,
        private route: ActivatedRoute,
        private operator: OperatorService,
        private router: Router,
        private repo: MotionCategoryRepositoryService,
        private motionService: MotionService,
        private promptService: PromptService,
        private formBuilder: FormBuilder,
        private dialog: MatDialog
    ) {
        super(componentServiceCollector);
    }

    /**
     * Init function.
     * Sets the title, observes the block and the motions belonging in this block
     */
    public ngOnInit(): void {
        super.ngOnInit();
        const categoryId = +this.route.snapshot.params.id;
        this.loadCategoryById(categoryId);
    }

    public getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingIdService.meetingId],
            follow: [
                {
                    idField: 'motion_category_ids',
                    follow: [
                        {
                            idField: 'motion_ids',
                            fieldset: 'title',
                            follow: ['state_id', 'recommendation_id'],
                            additionalFields: ['category_weight']
                        }
                    ],
                    fieldset: 'sortList'
                }
            ],
            fieldset: []
        };
    }

    private loadCategoryById(categoryId: number): void {
        this.subscriptions.push(
            this.repo.getViewModelListObservable().subscribe(categories => {
                // Extract all sub-categories: The selected one and all child categories
                const selectedCategoryIndex = categories.findIndex(category => category.id === categoryId);

                if (selectedCategoryIndex < 0) {
                    return;
                }

                // Find index of last child. This can be easily done by searching, because this
                // is the flat sorted tree
                this.selectedCategory = categories[selectedCategoryIndex];
                super.setTitle(this.selectedCategory.prefixedName);

                let lastChildIndex: number;
                for (
                    lastChildIndex = selectedCategoryIndex + 1;
                    lastChildIndex < categories.length &&
                    categories[lastChildIndex].level > this.selectedCategory.level;
                    lastChildIndex++
                ) {}
                this.categories = categories.slice(selectedCategoryIndex, lastChildIndex);

                // setup datasources:
                this.categories.forEach(category => {
                    const dataSource = new MatTableDataSource<ViewMotion>();
                    dataSource.data = category.motions;
                    this.dataSources[category.id] = dataSource;
                });
            })
        );
    }

    /**
     * Returns the columns that should be shown in the table
     *
     * @returns an array of strings building the column definition
     */
    public getColumnDefinition(): string[] {
        return ['title', 'state', 'recommendation', 'anchor'];
    }

    /**
     * Click handler to delete a category
     */
    public async onDeleteButton(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this category and all subcategories?');
        const content = this.selectedCategory.prefixedName;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.selectedCategory);
            this.router.navigate(['../'], { relativeTo: this.route });
        }
    }

    /**
     * Clicking escape while in editForm should deactivate edit mode.
     *
     * @param event The key that was pressed
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.dialogRef.close();
        }
        if (event.key === 'Enter') {
            this.save();
        }
    }

    /**
     * Save event handler
     */
    public save(): void {
        this.repo
            .update(this.editForm.value, this.selectedCategory)
            .then(() => this.dialogRef.close())
            .catch(this.raiseError);
    }

    /**
     * Click handler for the edit button
     */
    public toggleEditMode(): void {
        this.editForm = this.formBuilder.group({
            prefix: [this.selectedCategory.prefix],
            name: [this.selectedCategory.name, Validators.required]
        });

        this.dialogRef = this.dialog.open(this.editDialog, infoDialogSettings);
    }

    /**
     * Fetch a motion's current recommendation label
     *
     * @param motion
     * @returns the current recommendation label (with extension)
     */
    public getRecommendationLabel(motion: ViewMotion): string {
        return this.motionService.getExtendedRecommendationLabel(motion);
    }

    /**
     * Fetch a motion's current state label
     *
     * @param motion
     * @returns the current state label (with extension)
     */
    public getStateLabel(motion: ViewMotion): string {
        return this.motionService.getExtendedStateLabel(motion);
    }

    public getLevelDashes(category: ViewMotionCategory): string {
        const relativeLevel = category.level - this.selectedCategory.level;
        return '–'.repeat(relativeLevel);
    }

    /**
     * Triggers a numbering of the motions
     */
    public async numberMotions(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to renumber all motions of this category?');
        const content = this.selectedCategory.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.numberMotionsInCategory(this.selectedCategory).catch(this.raiseError);
        }
    }
}
