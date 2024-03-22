import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { OsFilterOptionCondition } from 'src/app/site/base/base-filter.service';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { ViewMotionCategory, ViewMotionState } from 'src/app/site/pages/meetings/pages/motions';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { GridBlockTileType } from 'src/app/ui/modules/grid';

import { MotionExportDialogService } from '../../../../components/motion-export-dialog/services/motion-export-dialog.service';
import { MotionForwardDialogService } from '../../../../components/motion-forward-dialog/services/motion-forward-dialog.service';
import { MotionMultiselectService } from '../../../../components/motion-multiselect/services/motion-multiselect.service';
import { MotionCategoryControllerService } from '../../../../modules/categories/services';
import { MotionBlockControllerService } from '../../../../modules/motion-blocks/services/motion-block-controller.service/motion-block-controller.service';
import { AmendmentControllerService } from '../../../../services/common/amendment-controller.service';
import { MotionControllerService } from '../../../../services/common/motion-controller.service';
import { MotionPermissionService } from '../../../../services/common/motion-permission.service';
import { MotionListFilterService } from '../../../../services/list/motion-list-filter.service';
import { MotionListSortService } from '../../../../services/list/motion-list-sort.service/motion-list-sort.service';
import { ViewMotion } from '../../../../view-models';
import { MotionListInfoDialogService } from '../../modules/motion-list-info-dialog';

/**
 * Determine the types of the motionList
 */
type MotionListviewType = 'tiles' | 'list';
const MOTION_LIST_STORAGE_INDEX = `motions`;

/**
 * Tile information
 */
interface TileCategoryInformation {
    filter: string;
    name: string;
    prefix?: string;
    condition: OsFilterOptionCondition;
    amountOfMotions: number;
}

@Component({
    selector: `os-motion-list`,
    templateUrl: `./motion-list.component.html`,
    styleUrls: [`./motion-list.component.scss`]
})
export class MotionListComponent extends BaseMeetingListViewComponent<ViewMotion> implements OnInit {
    public readonly gridBlockType = GridBlockTileType;

    /**
     * String to define the current selected view.
     */
    public selectedView: MotionListviewType | undefined = undefined; // Not initialized

    /**
     * The motion, the user has currently selected in the quick-edit-dialog.
     */
    public selectedMotion: ViewMotion | null = null;

    /**
     * Value of the configuration variable `motions_statutes_enabled` - are statutes enabled?
     * @TODO replace by direct access to config variable, once it's available from the templates
     */
    public statutesEnabled = false;

    /**
     * Value of the configuration variable `motions_amendments_enabled` - are amendments enabled?
     */
    public amendmentsEnabled = false;

    /**
     * Value of the config variable `motions_show_sequential_numbers`
     */
    public showSequential = false;

    public recommendationEnabled = false;

    public maxNumLength = 0;

    /**
     * Define extra filter properties
     */
    public filterProps = [
        `submitters`,
        `additional_submitter`,
        `block`,
        `title`,
        `number`,
        `getExtendedStateLabel`,
        `getExtendedRecommendationLabel`
    ];

    public get canForward(): boolean {
        return this._forwardingAvailable;
    }

    /**
     * List of `TileCategoryInformation`.
     * Necessary to not iterate over the values of the map below.
     */
    public listTiles: TileCategoryInformation[] = [];

    private motionTiles: TileCategoryInformation[] = [];

    private categoryTiles: TileCategoryInformation[] = [];

    private _forwardingAvailable = false;

    /**
     * The verbose name for the motions.
     */
    public motionsVerboseName = ``;

    protected get hasCategories(): boolean {
        return this._hasCategories;
    }

    protected get hasMotionBlocks(): boolean {
        return this._hasMotionBlocks;
    }

    protected get hasAmendments(): boolean {
        return this._hasAmendments;
    }

    /**
     * The recommender of the current meeting.
     */
    private _recommender?: string;
    private _hasCategories = false;
    private _hasMotionBlocks = false;
    private _hasAmendments = false;

    public constructor(
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        public filterService: MotionListFilterService,
        public sortService: MotionListSortService,
        private infoDialog: MotionListInfoDialogService,
        private exportDialog: MotionExportDialogService,
        private categoryController: MotionCategoryControllerService,
        private motionBlockController: MotionBlockControllerService,
        public motionRepo: MotionControllerService,
        public amendmentController: AmendmentControllerService,
        public motionService: MotionForwardDialogService,
        public multiselectService: MotionMultiselectService,
        public perms: MotionPermissionService,
        public vp: ViewPortService,
        public operator: OperatorService
    ) {
        super();
        this.canMultiSelect = true;
        this.listStorageIndex = MOTION_LIST_STORAGE_INDEX;

        this.motionService.forwardingMeetingsAvailable().then(forwardingAvailable => {
            this._forwardingAvailable = forwardingAvailable;
        });
    }

    /**
     * Init function.
     *
     * Sets the title, inits the table, defines the filter/sorting options and
     * subscribes to filter and sorting services
     */
    public async ngOnInit(): Promise<void> {
        super.setTitle(`Motions`);

        this.subscriptions.push(
            this.meetingSettingsService
                .get(`motions_statutes_enabled`)
                .subscribe(enabled => (this.statutesEnabled = enabled)),
            this.meetingSettingsService
                .get(`motions_amendments_enabled`)
                .subscribe(enabled => (this.amendmentsEnabled = enabled)),

            this.meetingSettingsService.get(`motions_recommendations_by`).subscribe(recommender => {
                this._recommender = recommender;
            }),
            this.meetingSettingsService
                .get(`motions_show_sequential_number`)
                .subscribe(show => (this.showSequential = show)),
            this.categoryController
                .getViewModelListObservable()
                .pipe(map(categories => categories?.length > 0))
                .subscribe(isAvailable => {
                    this._hasCategories = isAvailable;
                    this.setupListView(isAvailable);
                }),
            this.motionBlockController.getViewModelListObservable().subscribe(motionBlocks => {
                this._hasMotionBlocks = motionBlocks.filter(motionBlock => !motionBlock.internal).length > 0;
            }),
            this.motionRepo.getViewModelListObservable().subscribe(motions => {
                if (motions && motions.length) {
                    this.createMotionTiles(motions);
                }

                let maxNumLength = 0;
                for (const motion of motions) {
                    if (motion.number.length - 3 > maxNumLength) {
                        maxNumLength = Math.min(motion.number.length - 3, 8);
                    }
                }
                this.maxNumLength = maxNumLength;
            }),
            this.amendmentController.getViewModelListObservable().subscribe(amendments => {
                this._hasAmendments = !!amendments.length;
            })
        );
    }

    public async forwardMotionsToMeetings(motions: ViewMotion[]): Promise<void> {
        await this.motionService.forwardMotionsToMeetings(...motions);
    }

    /**
     * Publishes the tileList
     */
    private createTileList(): void {
        this.listTiles = this.categoryTiles.concat(this.motionTiles);
    }

    /**
     * @returns the columns hidden in mobile mode according to the
     * current permissions
     */
    public getColumnsHiddenInMobile(): string[] {
        const hiddenColumns = [`number`, `state`];

        if (!this.perms.canAccessMobileDotMenu()) {
            hiddenColumns.push(`menu`);
        }

        return hiddenColumns;
    }

    /**
     * Creates the tiles for categories.
     * Filters thous without parent, sorts them by theit weight, maps them to TileInfo and publishes
     * the result
     */
    private createCategoryTiles(categories: ViewMotionCategory[]): void {
        this.categoryTiles = categories
            .filter(category => !category.parent_id && !!category.totalAmountOfMotions)
            .sort((a, b) => a.weight - b.weight)
            .map(category => ({
                filter: `category_id`,
                name: category.name,
                condition: category.id,
                amountOfMotions: category.totalAmountOfMotions,
                prefix: category.prefix
            }));
    }

    /**
     * Creates the tiles for motions
     * @param motions
     */
    private createMotionTiles(motions: ViewMotion[]): void {
        this.motionTiles = [];
        let favoriteMotions = 0;
        let motionsWithNotes = 0;
        let motionsWithoutCategory = 0;
        const localCategories = new Set<ViewMotionCategory>();

        for (const motion of motions) {
            if (!motion.category) {
                motionsWithoutCategory++;
            } else {
                localCategories.add(motion.category.oldestParent);
            }
            favoriteMotions += +this.motionHasProp(motion, `isFavorite`);
            motionsWithNotes += +this.motionHasProp(motion, `hasNotes`);
        }

        this.addToTileInfo(`Favorites`, `isFavorite`, true, favoriteMotions);
        this.addToTileInfo(`Personal notes`, `hasNotes`, true, motionsWithNotes);
        this.addToTileInfo(`No category`, `category_id`, null, motionsWithoutCategory);

        this.createCategoryTiles(Array.from(localCategories));

        this.createTileList();
    }

    public getPossibleRecommendations(motion: ViewMotion): ViewMotionState[] {
        const allStates = motion.state!.workflow.states;
        return allStates.filter(state => state.recommendation_label);
    }

    /**
     * @returns true if the motion has the given prop
     */
    private motionHasProp(motion: ViewMotion, property: keyof ViewMotion, positive = true): boolean {
        return !!motion[property] === positive ? true : false;
    }

    /**
     * Helper function to add new tile information to the tileCategories-List
     */
    private addToTileInfo(name: string, filter: string, condition: OsFilterOptionCondition, amount: number): void {
        if (amount) {
            this.motionTiles.push({
                filter,
                name,
                condition,
                amountOfMotions: amount
            });
        }
    }

    /**
     * Handler for the plus button
     */
    public onPlusButton(): void {
        this.router.navigate([`./new`], { relativeTo: this.route });
    }

    /**
     * Opens the export dialog.
     * The export will be limited to the selected data if multiselect modus is
     * active and there are rows selected
     */
    public async openExportDialog(): Promise<void> {
        const motions = this.isMultiSelect ? this.selectedRows : this.listComponent.source;
        await this.exportDialog.export(motions);
    }

    /**
     * This function saves the selected view by changes.
     *
     * @param value is the new view the user has selected.
     */
    public onChangeView(value: MotionListviewType): void {
        this.selectedView = value;
        this.storage.set(`motionListView`, value);
    }

    /**
     * This function changes the view to the list of motions where the selected category becomes the active filter.
     *
     * @param tileCategory information about filter and condition.
     */
    public changeToViewWithTileCategory(tileCategory: TileCategoryInformation): void {
        this.onChangeView(`list`);
        this.filterService.clearAllFilters();
        this.filterService.toggleFilterOption(tileCategory.filter as any, {
            label: tileCategory.name,
            condition: tileCategory.condition,
            isActive: false
        });
    }

    public isRecommendationEnabled(motion: ViewMotion): boolean {
        return (
            (this.perms.isAllowed(`change_metadata`) || !!motion.recommendation) &&
            !!this._recommender &&
            !!this.getPossibleRecommendations(motion).length
        );
    }

    /**
     * Opens a dialog to edit some meta information about a motion.
     *
     * @param motion the ViewMotion whose content is edited.
     */
    public async openEditInfo(motion: ViewMotion): Promise<void> {
        if (this.isMultiSelect || !this.perms.isAllowed(`change_metadata`)) {
            return;
        }

        this.selectedMotion = motion;
        // The interface holding the current information from motion.
        const dialogRef = await this.infoDialog.open({
            id: motion.id,
            title: motion.title,
            update: { block_id: motion.block_id, category_id: motion.category_id, tag_ids: motion.tag_ids },
            state_id: motion.state_id,
            recommendation_id: motion.recommendation_id
        });

        const result = await firstValueFrom(dialogRef.afterClosed());
        if (result) {
            delete result.title; // Do not update the title!
            await this.motionRepo
                .update(result.update, motion)
                .concat(
                    this.motionRepo.setState(result.state_id!, motion),
                    this.motionRepo.setRecommendation(result.recommendation_id!, motion)
                )
                .resolve();
        }

        this.selectedMotion = null;
    }

    private setupListView(isAvailable: boolean): void {
        this.storage
            .get<MotionListviewType>(`motionListView`)
            .then(type => (this.selectedView = isAvailable && type ? type : `list`));
    }
}
