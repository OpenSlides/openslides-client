import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { MotionCategoryControllerService } from '../../../../modules/categories/services';
import { TagControllerService } from '../../../../modules/tags/services/tag-controller.service/tag-controller.service';
import { MotionMultiselectService } from '../../services/motion-multiselect.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { ViewMotionBlock, ViewTag, ViewMotionCategory, ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MotionExportDialogService } from '../../../motion-export-dialog/services/motion-export-dialog.service';
import { MotionBlockControllerService } from '../../../../modules/motion-blocks/services';
import { Permission } from 'src/app/domain/definitions/permission';

@Component({
    selector: 'os-motion-multiselect-actions',
    templateUrl: './motion-multiselect-actions.component.html',
    styleUrls: ['./motion-multiselect-actions.component.scss']
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
        private exportDialog: MotionExportDialogService
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
    public openExportDialog(): void {
        this.exportDialog.export(this.selectedMotions);
    }
}
