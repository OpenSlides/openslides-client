import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { PROJECTIONDEFAULT } from 'src/app/domain/models/projector/projection-default';
import { ViewMotion, ViewMotionBlock, ViewMotionCategory, ViewTag } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';
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
        protected translate: TranslateService,
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
        const sortedMotions = await this.sortService.sort(this.selectedMotions);
        const motions_ids = sortedMotions.map(motion => motion.id);
        this.componentServiceCollector.router.navigate([`motion-export`], {
            relativeTo: this.route,
            queryParams: { motions: motions_ids }
        });
    }

    public addToProjectorQueue(): ProjectionBuildDescriptor {
        const toBeProjectedItems: ViewMotion[] = this.selectedMotions;
        const results = [];
        this.sortService.getSortedViewModelListObservable().subscribe(item => results.push(item));
        const originalOrder = results[0].map((motion: ViewMotion) => `motion/` + motion.id);

        if (toBeProjectedItems) {
            const ids = toBeProjectedItems.map(item => `motion/` + item.id);
            ids.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));

            return {
                content_object_id: ids,
                projectionDefault: PROJECTIONDEFAULT.motion,
                getDialogTitle: (): string => this.translate.instant(`Motions`)
            };
        } else {
            return {
                content_object_id: null,
                projectionDefault: PROJECTIONDEFAULT.motion,
                getDialogTitle: (): string => this.translate.instant(`Motions`)
            };
        }
    }
}
