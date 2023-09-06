import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ItemTypeChoices } from 'src/app/domain/models/agenda/agenda-item';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';

import { ChangeRecoMode } from '../../../../../../../../../domain/models/motions/motions.constants';
import { MotionExportDialogService } from '../../../../components/motion-export-dialog/services/motion-export-dialog.service';
import { MotionMultiselectService } from '../../../../components/motion-multiselect/services/motion-multiselect.service';
import { LineNumberingService } from '../../../../modules/change-recommendations/services/line-numbering.service/line-numbering.service';
import { AMENDMENT_LIST_SUBSCRIPTION } from '../../../../motions.subscription';
import { AmendmentControllerService } from '../../../../services/common/amendment-controller.service/amendment-controller.service';
import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';
import { MotionExportService } from '../../../../services/export/motion-export.service/motion-export.service';
import { MotionPdfExportService } from '../../../../services/export/motion-pdf-export.service/motion-pdf-export.service';
import { AmendmentListFilterService } from '../../../../services/list/amendment-list-filter.service/amendment-list-filter.service';
import { AmendmentListSortService } from '../../../../services/list/amendment-list-sort.service/amendment-list-sort.service';
import { MotionListSortService } from '../../../../services/list/motion-list-sort.service/motion-list-sort.service';
import { ViewMotion } from '../../../../view-models';

const AMENDMENT_LIST_STORAGE_INDEX = `amendment_list`;

@Component({
    selector: `os-amendment-list`,
    templateUrl: `./amendment-list.component.html`,
    styleUrls: [`./amendment-list.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class AmendmentListComponent extends BaseMeetingListViewComponent<ViewMotion> implements OnInit {
    /**
     * Hold the Id of the parent motion
     */
    private parentMotionId: Id | null = null;

    public ready = false;

    /**
     * Hold the parent motion if present
     */
    public parentMotion: Observable<ViewMotion | null> = of(null);

    /**
     * Hold item visibility
     */
    public itemVisibility = ItemTypeChoices;

    public showSequentialNumber = false;

    /**
     * To filter stuff
     */
    public filterProps = [`submitters`, `title`, `number`];

    private _amendmentDiffLinesMap: { [amendmentId: number]: string } = {};

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        public amendmentRepo: AmendmentControllerService,
        public motionService: MotionControllerService,
        public motionSortService: MotionListSortService,
        public motionMultiSelectService: MotionMultiselectService,
        public amendmentSortService: AmendmentListSortService,
        public amendmentFilterService: AmendmentListFilterService,
        private dialog: MotionExportDialogService,
        private motionExport: MotionExportService,
        private linenumberingService: LineNumberingService,
        private pdfExport: MotionPdfExportService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Amendments`);
        this.canMultiSelect = true;
        this.listStorageIndex = AMENDMENT_LIST_STORAGE_INDEX;
        this.modelRequestService.waitSubscriptionReady(AMENDMENT_LIST_SUBSCRIPTION).then(() => (this.ready = true));
    }

    public ngOnInit(): void {
        // determine if a paramter exists.
        if (this.route.snapshot.paramMap.get(`id`)) {
            // set the parentMotion observable. This will "only" fire
            // if there is a subscription to the parent motion
            this.parentMotion = this.route.paramMap.pipe(
                switchMap((params: ParamMap) => {
                    this.parentMotionId = +params.get(`id`)!;
                    this.amendmentFilterService.parentMotionId = this.parentMotionId;
                    return this.amendmentRepo.getViewModelObservable(this.parentMotionId);
                })
            );
        } else {
            this.amendmentFilterService.parentMotionId = null;
        }

        this.subscriptions.push(
            this.amendmentFilterService.outputObservable
                .pipe(distinctUntilChanged((x, y) => x.length === y.length))
                .subscribe(amendments => {
                    for (const amendment of amendments) {
                        this._amendmentDiffLinesMap[amendment.id] = this.getAmendmentDiffLines(amendment);
                    }
                }),
            this.meetingSettingsService
                .get(`motions_show_sequential_number`)
                .subscribe(show => (this.showSequentialNumber = show))
        );
    }

    /**
     * Formulate the amendment summary
     *
     * @param amendment the motion to create the amendment to
     * @returns the amendments as string, if they are multiple they gonna be separated by `[...]`
     */
    public getAmendmentSummary(amendment: ViewMotion): string {
        return this._amendmentDiffLinesMap[amendment.id];
    }

    // todo put in own file
    public async openExportDialog(): Promise<void> {
        const dialogRef = await this.dialog.open(this.listComponent.source);
        const exportInfo = await firstValueFrom(dialogRef.afterClosed());
        if (exportInfo) {
            this.motionExport.evaluateExportRequest(
                exportInfo,
                this.isMultiSelect ? this.selectedRows : this.listComponent.source
            );
        }
    }

    /**
     * Export the given motion ist as special PDF
     */
    public exportAmendmentListPdf(): void {
        const parentMotion = this.parentMotionId ? this.amendmentRepo.getViewModel(this.parentMotionId)! : undefined;
        this.pdfExport.exportAmendmentList(this.listComponent.source, parentMotion);
    }

    public getAmendmentDiffLines(amendment: ViewMotion): string {
        const diffLines = amendment.getAmendmentParagraphLines(ChangeRecoMode.Changed);
        if (diffLines.length) {
            return diffLines.map(diffLine => this.linenumberingService.stripLineNumbers(diffLine.text)).join(`[...]`);
        } else {
            return amendment.text;
        }
    }

    public getChangedLinesFromAmendment(amendment: ViewMotion): string | null {
        return amendment.getChangedLines();
    }
}
