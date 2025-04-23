import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';
import { ViewMotion, ViewMotionBlock, ViewMotionCategory, ViewTag } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { SortListService } from 'src/app/ui/modules/list';

import { MotionCategoryControllerService } from '../../../../modules/categories/services';
import { MotionBlockControllerService } from '../../../../modules/motion-blocks/services';
import { TagControllerService } from '../../../../modules/tags/services/tag-controller.service/tag-controller.service';
import { MotionListSortService } from '../../../../services/list/motion-list-sort.service';
import { MotionMultiselectService } from '../../services/motion-multiselect.service';

@Component({
    selector: `os-motion-multiselect-actions`,
    templateUrl: `./motion-multiselect-actions.component.html`,
    styleUrls: [`./motion-multiselect-actions.component.scss`],
    standalone: false
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

    @Input()
    public sortService: SortListService<ViewMotion> = this._sortService;

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

    protected componentServiceCollector = inject(ComponentServiceCollectorService);

    public constructor(
        public multiselectService: MotionMultiselectService,
        private categoryRepo: MotionCategoryControllerService,
        private motionBlockRepo: MotionBlockControllerService,
        private tagRepo: TagControllerService,
        private meetingSettingsService: MeetingSettingsService,
        private _sortService: MotionListSortService,
        private route: ActivatedRoute
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
        const motions_ids = this.selectedMotions.map(motion => motion.id);
        this.componentServiceCollector.router.navigate([`motion-export`], {
            relativeTo: this.route,
            queryParams: { motions: motions_ids }
        });
    }
}
