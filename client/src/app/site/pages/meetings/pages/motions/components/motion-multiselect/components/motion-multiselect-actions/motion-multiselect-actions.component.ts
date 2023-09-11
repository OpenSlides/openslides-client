import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { ViewMotion, ViewMotionBlock, ViewMotionCategory, ViewTag } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { MotionCategoryControllerService } from '../../../../modules/categories/services';
import { MotionBlockControllerService } from '../../../../modules/motion-blocks/services';
import { TagControllerService } from '../../../../modules/tags/services/tag-controller.service/tag-controller.service';
import { MotionListSortService } from '../../../../services/list/motion-list-sort.service';
import { MotionExportDialogService } from '../../../motion-export-dialog/services/motion-export-dialog.service';
import { MotionMultiselectService } from '../../services/motion-multiselect.service';

@Component({
    selector: `os-motion-multiselect-actions`,
    templateUrl: `./motion-multiselect-actions.component.html`,
    styleUrls: [`./motion-multiselect-actions.component.scss`]
})
export class MotionMultiselectActionsComponent extends BaseUiComponent implements OnInit {
    public readonly permission = Permission;

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

    public constructor(
        public multiselectService: MotionMultiselectService,
        private categoryRepo: MotionCategoryControllerService,
        private motionBlockRepo: MotionBlockControllerService,
        private tagRepo: TagControllerService,
        private meetingSettingsService: MeetingSettingsService,
        private exportDialog: MotionExportDialogService,
        private sortService: MotionListSortService
    ) {
        super();
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
            this.meetingSettingsService.get(`motions_recommendations_by`).subscribe(recommender => {
                this.recommendationEnabled = !!recommender;
            })
        );
    }

    /**
     * Opens the dialog to choose options for exporting selected motions.
     */
    public async openExportDialog(): Promise<void> {
        this.exportDialog.export(await this.sortService.sort(this.selectedMotions));
    }
}
