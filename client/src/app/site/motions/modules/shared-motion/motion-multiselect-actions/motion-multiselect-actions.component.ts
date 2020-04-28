import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionBlock } from 'app/site/motions/models/view-motion-block';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { MotionExportInfo, MotionExportService } from 'app/site/motions/services/motion-export.service';
import { MotionMultiselectService } from 'app/site/motions/services/motion-multiselect.service';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { MotionExportDialogComponent } from '../motion-export-dialog/motion-export-dialog.component';

@Component({
    selector: 'os-motion-multiselect-actions',
    templateUrl: './motion-multiselect-actions.component.html',
    styleUrls: ['./motion-multiselect-actions.component.scss']
})
export class MotionMultiselectActionsComponent extends BaseComponent implements OnInit {
    /**
     * The list of the selected motions.
     */
    @Input()
    public selectedMotions: ViewMotion[] = [];

    /**
     * An EventEmitter to send the selected actions.
     */
    @Output()
    public action = new EventEmitter<Promise<void>>();

    /**
     * Boolean, if the recommendation is enabled.
     */
    public recommendationEnabled = false;

    /**
     * The list of all categories.
     */
    public categories: ViewMotionCategory[] = [];

    /**
     * The list of all tags.
     */
    public tags: ViewTag[] = [];

    /**
     * The list of all motion-blocks.
     */
    public motionBlocks: ViewMotionBlock[] = [];

    /**
     * The default constructor.
     *
     * @param multiselectService
     * @param categoryRepo
     * @param motionBlockRepo
     * @param tagRepo
     * @param organisationSettingsService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public multiselectService: MotionMultiselectService,
        private categoryRepo: MotionCategoryRepositoryService,
        private motionBlockRepo: MotionBlockRepositoryService,
        private tagRepo: TagRepositoryService,
        private organisationSettingsService: OrganisationSettingsService,
        private dialog: MatDialog,
        private motionExport: MotionExportService
    ) {
        super(componentServiceCollector);
    }

    /**
     * OnInit-method.
     *
     * Subscribe to all view-model-lists.
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.categoryRepo.getViewModelListObservable().subscribe(categories => (this.categories = categories)),
            this.motionBlockRepo.getViewModelListObservable().subscribe(blocks => (this.motionBlocks = blocks)),
            this.tagRepo.getViewModelListObservable().subscribe(tags => (this.tags = tags)),
            this.organisationSettingsService.get<string>('motions_recommendations_by').subscribe(recommender => {
                this.recommendationEnabled = !!recommender;
            })
        );
    }

    /**
     * Opens the dialog to choose options for exporting selected motions.
     */
    public openExportDialog(): void {
        const exportDialogRef = this.dialog.open(MotionExportDialogComponent, largeDialogSettings);

        exportDialogRef
            .afterClosed()
            .subscribe((exportInfo: MotionExportInfo) =>
                this.motionExport.evaluateExportRequest(exportInfo, this.selectedMotions)
            );
    }
}
