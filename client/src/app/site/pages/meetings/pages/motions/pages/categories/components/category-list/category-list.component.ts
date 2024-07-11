import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewMotionCategory } from '../../../../modules';
import { MotionCategoryControllerService } from '../../../../modules/categories/services';

const CATEGORY_LIST_STORAGE_INDEX = `category_list`;

@Component({
    selector: `os-category-list`,
    templateUrl: `./category-list.component.html`,
    styleUrls: [`./category-list.component.scss`]
})
export class CategoryListComponent extends BaseMeetingListViewComponent<ViewMotionCategory> implements OnInit {
    @ViewChild(`newCategoryDialog`, { static: true })
    private newCategoryDialog: TemplateRef<string> | null = null;

    private dialogRef: MatDialogRef<any> | null = null;

    public get categoriesObservable(): Observable<ViewMotionCategory[]> {
        return this.repo.getViewModelListObservable();
    }

    /**
     * Holds the create form
     */
    public createForm: UntypedFormGroup;

    /**
     * Define extra filter properties
     */
    public filterProps = [`prefixedName`];

    /**
     * helper for permission checks
     *
     * @returns true if the user may alter motions or their metadata
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.motionCanManage);
    }

    public constructor(
        protected override translate: TranslateService,
        public repo: MotionCategoryControllerService,
        private formBuilder: UntypedFormBuilder,
        private dialog: MatDialog,
        private operator: OperatorService
    ) {
        super();
        this.listStorageIndex = CATEGORY_LIST_STORAGE_INDEX;

        this.createForm = this.formBuilder.group({
            prefix: [``],
            name: [``, Validators.required],
            parent_id: [``]
        });
    }

    /**
     * Observe the agendaItems for changes.
     */
    public ngOnInit(): void {
        super.setTitle(`Categories`);
    }

    public getMotionAmount(category: ViewMotionCategory): number {
        return category.motion_ids?.length || 0;
    }

    /**
     * Click handler for the plus button
     */
    public onPlusButton(): void {
        this.createForm.reset();
        this.dialogRef = this.dialog.open(this.newCategoryDialog!, infoDialogSettings);
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
        if (event.key === `Enter`) {
            this.save();
            this.dialogRef!.close();
        }
        if (event.key === `Escape`) {
            this.dialogRef!.close();
        }
    }

    public getMargin(category: ViewMotionCategory): string {
        return `${category.level * 20}px`;
    }
}
