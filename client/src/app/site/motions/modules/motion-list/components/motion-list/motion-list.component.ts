import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { PblColumnDefinition } from '@pebula/ngrid';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import {
    GET_POSSIBLE_RECOMMENDATIONS,
    MotionRepositoryService,
    SUBMITTER_FOLLOW
} from 'app/core/repositories/motions/motion-repository.service';
import { MotionWorkflowRepositoryService } from 'app/core/repositories/motions/motion-workflow-repository.service';
import { MotionService } from 'app/core/repositories/motions/motion.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { OsFilterOptionCondition } from 'app/core/ui-services/base-filter-list.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SPEAKER_BUTTON_FOLLOW } from 'app/shared/components/speaker-button/speaker-button.component';
import { infoDialogSettings, largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionBlock } from 'app/site/motions/models/view-motion-block';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { MotionExportInfo, MotionExportService } from 'app/site/motions/services/motion-export.service';
import { MotionFilterListService } from 'app/site/motions/services/motion-filter-list.service';
import { MotionMultiselectService } from 'app/site/motions/services/motion-multiselect.service';
import { MotionSortListService } from 'app/site/motions/services/motion-sort-list.service';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { MotionExportDialogComponent } from '../../../shared-motion/motion-export-dialog/motion-export-dialog.component';

/**
 * Determine the types of the motionList
 */
type MotionListviewType = 'tiles' | 'list';

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

/**
 * Interface to describe possible values and changes for
 * meta information dialog.
 */
interface InfoDialog {
    /**
     * The title of the motion
     */
    title: string;

    update: {
        /**
         * The motion block id
         */
        block_id: number;

        /**
         * The category id
         */
        category_id: number;

        /**
         * The motions tag ids
         */
        tag_ids: number[];
    };

    /**
     * The id of the state
     */
    state_id: number;

    /**
     * The id of the recommendation
     */
    recommendation_id: number;
}

/**
 * Component that displays all the motions in a Table using DataSource.
 */
@Component({
    selector: 'os-motion-list',
    templateUrl: './motion-list.component.html',
    styleUrls: ['./motion-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionListComponent extends BaseListViewComponent<ViewMotion> implements OnInit {
    /**
     * Reference to the dialog for quick editing meta information.
     */
    @ViewChild('motionInfoDialog', { static: true })
    private motionInfoDialog: TemplateRef<string>;

    /**
     * Interface to hold meta information.
     */
    public infoDialog: InfoDialog;

    /**
     * String to define the current selected view.
     */
    public selectedView: MotionListviewType;

    /**
     * The motion, the user has currently selected in the quick-edit-dialog.
     */
    public selectedMotion: ViewMotion = null;

    /**
     * Columns to display in table when desktop view is available
     * Define the columns to show
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'number'
        },
        {
            prop: 'title',
            width: 'auto'
        },
        {
            prop: 'state',
            width: '20%',
            minWidth: 160
        }
    ];

    /**
     * Value of the configuration variable `motions_statutes_enabled` - are statutes enabled?
     * @TODO replace by direct access to config variable, once it's available from the templates
     */
    public statutesEnabled: boolean;

    /**
     * Value of the configuration variable `motions_amendments_enabled` - are amendments enabled?
     */
    public amendmentsEnabled: boolean;

    /**
     * Value of the config variable `motions_show_sequential_numbers`
     */
    public showSequential: boolean;

    public recommendationEnabled: boolean;

    public tags: ViewTag[] = [];
    public workflows: ViewMotionWorkflow[] = [];
    public categories: ViewMotionCategory[] = [];
    public motionBlocks: ViewMotionBlock[] = [];

    /**
     * Define extra filter properties
     *
     * TODO: repo.getExtendedStateLabel(), repo.getExtendedRecommendationLabel()
     */
    public filterProps = ['submitters', 'block', 'title', 'number'];

    /**
     * List of `TileCategoryInformation`.
     * Necessary to not iterate over the values of the map below.
     */
    public listTiles: TileCategoryInformation[];

    private motionTiles: TileCategoryInformation[] = [];

    private categoryTiles: TileCategoryInformation[] = [];

    /**
     * The verbose name for the motions.
     */
    public motionsVerboseName: string;

    /**
     * The recommender of the current meeting.
     */
    private recommender?: string;

    /**
     * Constructor implements title and translation Module.
     *
     * @param titleService Title
     * @param translate Translation
     * @param matSnackBar showing errors
     * @param sortService sorting
     * @param filterService filtering
     * @param router Router
     * @param route Current route
     * @param meetingSettingsService The configuration provider
     * @param repo Motion Repository
     * @param tagRepo Tag Repository
     * @param motionBlockRepo
     * @param categoryRepo
     * @param categoryRepo: Repo for categories. Used to define filters
     * @param workflowRepo: Repo for Workflows. Used to define filters
     * @param motionCsvExport
     * @param pdfExport To export motions as PDF
     * @param multiselectService Service for the multiSelect actions
     * @param userRepo
     * @param vp
     * @param perms LocalPermissionService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private route: ActivatedRoute,
        public filterService: MotionFilterListService,
        public sortService: MotionSortListService,
        private router: Router,
        private meetingSettingsService: MeetingSettingsService,
        private tagRepo: TagRepositoryService,
        private motionBlockRepo: MotionBlockRepositoryService,
        private categoryRepo: MotionCategoryRepositoryService,
        private workflowRepo: MotionWorkflowRepositoryService,
        public motionRepo: MotionRepositoryService,
        public motionService: MotionService,
        private dialog: MatDialog,
        public multiselectService: MotionMultiselectService,
        public perms: PermissionsService,
        private motionExport: MotionExportService,
        public vp: ViewportService,
        public operator: OperatorService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(componentServiceCollector);
        this.canMultiSelect = true;
    }

    /**
     * Init function.
     *
     * Sets the title, inits the table, defines the filter/sorting options and
     * subscribes to filter and sorting services
     */
    public async ngOnInit(): Promise<void> {
        super.ngOnInit();
        super.setTitle('Motions');

        this.subscriptions.push(
            this.meetingSettingsService
                .get('motions_statutes_enabled')
                .subscribe(enabled => (this.statutesEnabled = enabled)),
            this.meetingSettingsService
                .get('motions_amendments_enabled')
                .subscribe(enabled => (this.amendmentsEnabled = enabled)),

            this.meetingSettingsService.get('motions_recommendations_by').subscribe(recommender => {
                this.recommender = recommender;
            }),
            this.meetingSettingsService
                .get('motions_show_sequential_number')
                .subscribe(show => (this.showSequential = show)),
            this.motionBlockRepo.getViewModelListObservable().subscribe(mBs => {
                this.motionBlocks = mBs;
            }),
            this.categoryRepo.getViewModelListObservable().subscribe(cats => {
                this.categories = cats;
                if (cats.length > 0) {
                    this.storage.get<string>('motionListView').then((savedView: MotionListviewType) => {
                        this.selectedView = savedView ? savedView : 'tiles';
                    });
                } else {
                    this.selectedView = 'list';
                }
            }),
            this.tagRepo.getViewModelListObservable().subscribe(tags => {
                this.tags = tags;
            }),
            this.workflowRepo.getViewModelListObservable().subscribe(wfs => {
                this.workflows = wfs;
            }),
            this.motionRepo.getViewModelListObservable().subscribe(motions => {
                if (motions && motions.length) {
                    this.createMotionTiles(motions);
                }
            })
        );
        // TODO: remove
        this.amendmentsEnabled = true;
    }

    public async forwardMotionsToMeetings(motions: ViewMotion[]): Promise<void> {
        await this.motionService.forwardMotionsToMeetings(...motions);
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingIdService.meetingId],
            follow: [
                { idField: 'agenda_item_ids', follow: ['content_object_id'] },
                {
                    idField: 'motion_ids',
                    follow: [
                        'category_id',
                        'block_id',
                        'tag_ids',
                        'personal_note_ids',
                        {
                            idField: 'state_id',
                            follow: ['next_state_ids', GET_POSSIBLE_RECOMMENDATIONS],
                            fieldset: 'list'
                        },
                        {
                            idField: 'recommendation_id',
                            fieldset: 'list'
                        },
                        SUBMITTER_FOLLOW,
                        SPEAKER_BUTTON_FOLLOW
                    ],
                    fieldset: 'list',
                    additionalFields: ['text']
                },
                {
                    idField: 'motion_category_ids',
                    fieldset: 'list',
                    additionalFields: ['parent_id', 'child_ids']
                },
                {
                    idField: 'user_ids',
                    fieldset: 'shortName'
                }
            ],
            fieldset: []
        };
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
        const hiddenColumns = ['number', 'state'];

        if (!this.perms.canAccessMobileDotMenu()) {
            hiddenColumns.push('menu');
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
            .map(category => {
                return {
                    filter: 'category_id',
                    name: category.name,
                    condition: category.id,
                    amountOfMotions: category.totalAmountOfMotions,
                    prefix: category.prefix
                };
            });
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
            favoriteMotions += +this.motionHasProp(motion, 'star');
            motionsWithNotes += +this.motionHasProp(motion, 'hasNotes');
        }

        this.addToTileInfo('Favorites', 'star', true, favoriteMotions);
        this.addToTileInfo('Personal notes', 'hasNotes', true, motionsWithNotes);
        this.addToTileInfo('No category', 'category_id', null, motionsWithoutCategory);

        this.createCategoryTiles(Array.from(localCategories));

        this.createTileList();
    }

    public getPossibleRecommendations(motion: ViewMotion): ViewMotionState[] {
        const allStates = motion.state.workflow.states;
        return allStates.filter(state => state.recommendation_label);
    }

    /**
     * @returns true if the motion has the given prop
     */
    private motionHasProp(motion: ViewMotion, property: string, positive: boolean = true): boolean {
        return !!motion[property] === positive ? true : false;
    }

    /**
     * Helper function to add new tile information to the tileCategories-List
     */
    private addToTileInfo(name: string, filter: string, condition: OsFilterOptionCondition, amount: number): void {
        if (amount) {
            this.motionTiles.push({
                filter: filter,
                name: name,
                condition: condition,
                amountOfMotions: amount
            });
        }
    }

    /**
     * Handler for the plus button
     */
    public onPlusButton(): void {
        this.router.navigate(['./new'], { relativeTo: this.route });
    }

    /**
     * Opens the export dialog.
     * The export will be limited to the selected data if multiselect modus is
     * active and there are rows selected
     */
    public openExportDialog(): void {
        const exportDialogRef = this.dialog.open(MotionExportDialogComponent, {
            ...largeDialogSettings,
            data: this.dataSource
        });

        exportDialogRef
            .afterClosed()
            .subscribe((exportInfo: MotionExportInfo) =>
                this.motionExport.evaluateExportRequest(
                    exportInfo,
                    this.isMultiSelect ? this.selectedRows : this.dataSource.filteredData
                )
            );
    }

    /**
     * This function saves the selected view by changes.
     *
     * @param value is the new view the user has selected.
     */
    public onChangeView(value: MotionListviewType): void {
        this.selectedView = value;
        this.storage.set('motionListView', value);
    }

    /**
     * This function changes the view to the list of motions where the selected category becomes the active filter.
     *
     * @param tileCategory information about filter and condition.
     */
    public changeToViewWithTileCategory(tileCategory: TileCategoryInformation): void {
        this.onChangeView('list');
        this.filterService.clearAllFilters();
        this.filterService.toggleFilterOption(tileCategory.filter as any, {
            label: tileCategory.name,
            condition: tileCategory.condition,
            isActive: false
        });
    }

    public isRecommendationEnabled(motion: ViewMotion): boolean {
        return (
            (this.perms.isAllowed('change_metadata') || motion.recommendation) &&
            this.recommender &&
            !!this.getPossibleRecommendations(motion).length
        );
    }

    /**
     * Opens a dialog to edit some meta information about a motion.
     *
     * @param motion the ViewMotion whose content is edited.
     */
    public async openEditInfo(motion: ViewMotion): Promise<void> {
        if (this.isMultiSelect || !this.perms.isAllowed('change_metadata')) {
            return;
        }

        this.selectedMotion = motion;
        // The interface holding the current information from motion.
        this.infoDialog = {
            title: motion.title,
            update: { block_id: motion.block_id, category_id: motion.category_id, tag_ids: motion.tag_ids },
            state_id: motion.state_id,
            recommendation_id: motion.recommendation_id
        };

        const dialogRef = this.dialog.open(this.motionInfoDialog, infoDialogSettings);
        dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
            if (event.key === 'Enter' && event.shiftKey) {
                dialogRef.close(this.infoDialog);
            }
        });

        const result: InfoDialog = await dialogRef.afterClosed().toPromise();
        if (result) {
            delete result.title; // Do not update the title!
            await this.motionRepo.updateWithStateAndRecommendation(
                result.update,
                result.state_id,
                result.recommendation_id,
                motion
            );
        }

        this.selectedMotion = null;
    }

    /**
     * @returns if there are amendments or not
     */
    public hasAmendments(): boolean {
        return !!this.motionRepo.getAllAmendmentsInstantly().length;
    }

    /**
     * Checks if categories are available.
     *
     * @returns A boolean if they are available.
     */
    public isCategoryAvailable(): boolean {
        return !!this.categories && this.categories.length > 0;
    }

    /**
     * Checks if tags are available.
     *
     * @returns A boolean if they are available.
     */
    public isTagAvailable(): boolean {
        return !!this.tags && this.tags.length > 0;
    }

    /**
     * Checks motion-blocks are available.
     *
     * @returns A boolean if they are available.
     */
    public isMotionBlockAvailable(): boolean {
        return !!this.motionBlocks && this.motionBlocks.length > 0;
    }
}
