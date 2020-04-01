import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { PblColumnDefinition } from '@pebula/ngrid';

import { OperatorService } from 'app/core/core-services/operator.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component.';
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
        return this.operator.hasPerms('motions.can_manage');
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
        private operator: OperatorService
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
        super.setTitle('Categories');
    }

    /**
     * Click handler for the plus button
     */
    public onPlusButton(): void {
        this.createForm.reset();
        const dialogRef = this.dialog.open(this.newCategoryDialog, infoDialogSettings);
        dialogRef.afterClosed().subscribe(res => {
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
            this.repo.create(this.createForm.value).catch(this.raiseError);
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
            this.dialog.closeAll();
        }
        if (event.key === 'Escape') {
            this.dialog.closeAll();
        }
    }

    public getMargin(category: ViewMotionCategory): string {
        return `${category.level * 20}px`;
    }
}
