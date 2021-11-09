import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { MotionService } from 'app/core/repositories/motions/motion.service';
import {
    GET_POSSIBLE_RECOMMENDATIONS,
    MotionRepositoryService,
    SUBMITTER_FOLLOW
} from 'app/core/repositories/motions/motion-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { LinenumberingService } from 'app/core/ui-services/linenumbering.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SPEAKER_BUTTON_FOLLOW } from 'app/shared/components/speaker-button/speaker-button.component';
import { ItemTypeChoices } from 'app/shared/models/agenda/agenda-item';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ViewMotion } from '../../models/view-motion';
import { AmendmentFilterListService } from '../../services/amendment-filter-list.service';
import { AmendmentSortListService } from '../../services/amendment-sort-list.service';
import { MotionExportInfo, MotionExportService } from '../../services/motion-export.service';
import { MotionMultiselectService } from '../../services/motion-multiselect.service';
import { MotionPdfExportService } from '../../services/motion-pdf-export.service';
import { MotionSortListService } from '../../services/motion-sort-list.service';
import { MotionExportDialogComponent } from '../shared-motion/motion-export-dialog/motion-export-dialog.component';

/**
 * Shows all the amendments in the NGrid table
 */
@Component({
    selector: `os-amendment-list`,
    templateUrl: `./amendment-list.component.html`,
    styleUrls: [`./amendment-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AmendmentListComponent extends BaseListViewComponent<ViewMotion> implements OnInit {
    /**
     * Hold the Id of the parent motion
     */
    private parentMotionId: number;

    /**
     * Hold the parent motion if present
     */
    public parentMotion: Observable<ViewMotion>;

    /**
     * Hold item visibility
     */
    public itemVisibility = ItemTypeChoices;

    public showSequentialNumber: boolean;

    /**
     * Column defintiion
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `meta`,
            minWidth: 250,
            width: `50%`
        },
        {
            prop: `summary`,
            minWidth: 280,
            width: `50%`
        },
        {
            prop: `speakers`,
            width: this.singleButtonWidth
        }
    ];

    /**
     * To filter stuff
     */
    public filterProps = [`submitters`, `title`, `number`];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private route: ActivatedRoute,
        public motionRepo: MotionRepositoryService,
        public motionService: MotionService,
        public motionSortService: MotionSortListService,
        public motionMultiSelectService: MotionMultiselectService,
        public amendmentSortService: AmendmentSortListService,
        public amendmentFilterService: AmendmentFilterListService,
        private dialog: MatDialog,
        private motionExport: MotionExportService,
        private linenumberingService: LinenumberingService,
        private pdfExport: MotionPdfExportService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Amendments`);
        this.canMultiSelect = true;
    }

    public ngOnInit(): void {
        super.ngOnInit();
        // determine if a paramter exists.
        if (this.route.snapshot.paramMap.get(`id`)) {
            // set the parentMotion observable. This will "only" fire
            // if there is a subscription to the parent motion
            this.parentMotion = this.route.paramMap.pipe(
                switchMap((params: ParamMap) => {
                    this.parentMotionId = +params.get(`id`);
                    this.amendmentFilterService.parentMotionId = this.parentMotionId;
                    return this.motionRepo.getViewModelObservable(this.parentMotionId);
                })
            );
        } else {
            this.amendmentFilterService.parentMotionId = undefined;
        }

        this.meetingSettingService
            .get(`motions_show_sequential_number`)
            .subscribe(show => (this.showSequentialNumber = show));
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingIdService.meetingId],
            follow: [
                {
                    idField: `motion_ids`,
                    follow: [
                        `category_id`,
                        `block_id`,
                        `tag_ids`,
                        `personal_note_ids`,
                        {
                            idField: `state_id`,
                            follow: [`next_state_ids`, GET_POSSIBLE_RECOMMENDATIONS],
                            fieldset: `list`
                        },
                        {
                            idField: `recommendation_id`,
                            fieldset: `list`
                        },
                        SPEAKER_BUTTON_FOLLOW,
                        SUBMITTER_FOLLOW
                    ],
                    fieldset: `amendment`
                }
            ],
            fieldset: []
        };
    }

    /**
     * Formulate the amendment summary
     *
     * @param amendment the motion to create the amendment to
     * @returns the amendments as string, if they are multiple they gonna be separated by `[...]`
     */
    public getAmendmentSummary(amendment: ViewMotion): string {
        const diffLines = amendment.diffLines;
        if (diffLines.length) {
            return diffLines.map(diffLine => this.linenumberingService.stripLineNumbers(diffLine.text)).join(`[...]`);
        } else {
            return amendment.text;
        }
    }

    // todo put in own file
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
     * Export the given motion ist as special PDF
     */
    public exportAmendmentListPdf(): void {
        const parentMotion = this.parentMotionId ? this.motionRepo.getViewModel(this.parentMotionId) : undefined;
        this.pdfExport.exportAmendmentList(this.dataSource.filteredData, parentMotion);
    }
}
