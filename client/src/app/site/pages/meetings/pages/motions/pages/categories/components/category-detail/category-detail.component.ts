import { Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion, ViewMotionCategory } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { MotionCategoryControllerService } from '../../../../modules/categories/services';
import { MotionControllerService } from '../../../../services/common/motion-controller.service';

/**
 * Detail component to display one motion block
 */
@Component({
    selector: `os-category-detail`,
    templateUrl: `./category-detail.component.html`,
    styleUrls: [`./category-detail.component.scss`]
})
export class CategoryDetailComponent extends BaseMeetingComponent {
    public readonly COLLECTION = ViewMotionCategory.COLLECTION;

    /**
     * The form to edit the selected category
     */
    public editForm!: UntypedFormGroup;

    /**
     * Reference to the template for edit-dialog
     */
    @ViewChild(`editDialog`, { static: true })
    private readonly _editDialog: TemplateRef<string> | null = null;

    /**
     * The one selected category
     */
    public get selectedCategory(): ViewMotionCategory {
        return this._selectedCategory;
    }

    public set selectedCategory(category: ViewMotionCategory) {
        this._selectedCategory = category;
    }

    private _selectedCategory!: ViewMotionCategory;

    /**
     * All categories with the selected one and all children.
     */
    public categories: ViewMotionCategory[] = [];

    /**
     * Datasources for `categories`. Holds all motions for one category.
     */
    public readonly dataSources: { [id: number]: MatTableDataSource<ViewMotion> } = {};

    /**
     * helper for permission checks
     *
     * @returns true if the user may alter motions
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.motionCanManage);
    }

    private _dialogRef!: MatDialogRef<any>;
    private _categoryId: Id = -1;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        private operator: OperatorService,
        private repo: MotionCategoryControllerService,
        private motionService: MotionControllerService,
        private promptService: PromptService,
        private formBuilder: UntypedFormBuilder,
        private dialog: MatDialog
    ) {
        super(componentServiceCollector, translate);
    }

    public onIdFound(id: Id | null): void {
        if (id) {
            this._categoryId = id;
            this.loadCategoryById();
        }
    }

    private loadCategoryById(): void {
        this.subscriptions.push(
            this.repo.getViewModelListObservable().subscribe(categories => {
                // Extract all sub-categories: The selected one and all child categories
                const selectedCategory = categories.find(category => category.id === this._categoryId);

                if (!selectedCategory) {
                    return;
                }

                // Find index of last child. This can be easily done by searching, because this
                // is the flat sorted tree
                this.selectedCategory = selectedCategory;
                super.setTitle(this.selectedCategory.prefixedName);

                this.categories = categories.filter(category =>
                    [category]
                        .concat(...category.allParents)
                        .map(cat => cat.id)
                        .includes(this._categoryId)
                );

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
        return [`title`, `state`, `recommendation`, `anchor`];
    }

    /**
     * Click handler to delete a category
     */
    public async onDeleteButton(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this category and all subcategories?`);
        const content = this.selectedCategory.prefixedName;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.selectedCategory);
            this.router.navigate([`../`], { relativeTo: this.route });
        }
    }

    /**
     * Clicking escape while in editForm should deactivate edit mode.
     *
     * @param event The key that was pressed
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Escape`) {
            this._dialogRef.close();
        }
        if (event.key === `Enter`) {
            this.save();
        }
    }

    /**
     * Save event handler
     */
    public save(): void {
        this.repo
            .update(this.editForm!.value, this.selectedCategory)
            .then(() => {
                this._dialogRef.close();
            })
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

        this._dialogRef = this.dialog.open(this._editDialog!, infoDialogSettings);
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
        return `–`.repeat(relativeLevel);
    }

    /**
     * Triggers a numbering of the motions
     */
    public async numberMotions(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to renumber all motions of this category?`);
        const content = this.selectedCategory.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.numberMotionsInCategory(this.selectedCategory).catch(this.raiseError);
        }
    }
}
