import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { BaseBackendImportService } from 'src/app/site/base/base-import.service/base-backend-import.service';
import { MotionControllerService } from 'src/app/site/pages/meetings/pages/motions/services/common/motion-controller.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { ImportServiceCollectorService } from 'src/app/site/services/import-service-collector.service';
import { BackendImportRawPreview } from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

import { MotionCsvExportService } from '../../../services/export/motion-csv-export.service';
import { MotionsImportServiceModule } from './motions-import-service.module';

@Injectable({
    providedIn: MotionsImportServiceModule
})
export class MotionImportService extends BaseBackendImportService {
    /**
     * List of possible errors and their verbose explanation
     */
    public override readonly errorList = {
        MotionBlock: `Could not resolve the motion block`,
        Category: `Could not resolve the category`,
        Submitters: `Could not resolve the submitters`,
        Tags: `Could not resolve the tags`,
        Title: `A title is required`,
        Text: `A content in the 'text' column is required`,
        Duplicates: `A motion with this number already exists.`
    };

    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public override readonly requiredHeaderLength = 3;

    public override readonly verboseSummaryTitles: { [title: string]: string } = {
        total: _(`Total motions`),
        created: _(`Motions created`),
        updated: _(`Motions updated`),
        omitted: _(`Motions skipped`),
        warning: _(`Motions with warnings (will be skipped)`),
        error: _(`Motions with errors`)
    };

    /**
     * Constructor. Defines the headers expected and calls the abstract class
     * @param repo: The repository for motions.
     * @param categoryRepo Repository to fetch pre-existing categories
     * @param motionBlockRepo Repository to fetch pre-existing motionBlocks
     * @param userRepo Repository to query/ create users
     */
    public constructor(
        serviceCollector: ImportServiceCollectorService,
        private repo: MotionControllerService,
        private exporter: MotionCsvExportService,
        private activeMeetingId: ActiveMeetingIdService
    ) {
        super(serviceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.exportDummyMotion();
    }

    protected override calculateJsonUploadPayload(): any {
        const payload = super.calculateJsonUploadPayload();
        payload[`meeting_id`] = this.activeMeetingId.meetingId;
        return payload;
    }

    protected async import(
        actionWorkerIds: number[],
        abort = false
    ): Promise<void | (BackendImportRawPreview | void)[]> {
        return await this.repo.import(actionWorkerIds.map(id => ({ id, import: !abort }))).resolve();
    }

    protected async jsonUpload(payload: { [key: string]: any }): Promise<void | BackendImportRawPreview[]> {
        return await this.repo.jsonUpload(payload).resolve();
    }

    // protected getConfig(): ImportConfig<ViewMotion> {
    //     return {
    //         modelHeadersAndVerboseNames: getMotionExportHeadersAndVerboseNames(),
    //         verboseNameFn: plural => this.repo.getVerboseName(plural),
    //         getDuplicatesFn: (entry: Partial<Motion>) =>
    //             this.repo.getViewModelList().filter(motion => motion.number === entry.number),
    //         createFn: (entries: Motion[]) => this.repo.create(...entries)
    //     };
    // }

    // protected override getBeforeImportHelpers(): { [key: string]: BeforeImportHandler<ViewMotion> } {
    //     return {
    //         [MOTION_BLOCK_PROPERTY]: new MotionBlockImportHelper(this.motionBlockRepo, this.translate),
    //         [CATEGORY_PROPERTY]: new CategoryImportHelper(this.categoryRepo, this.translate),
    //         [TAG_PROPERTY]: new TagImportHelper(this.tagRepo),
    //         [SUBMITTER_PROPERTY]: new UserImportHelper({
    //             repo: this.userRepo,
    //             verboseName: `Submitters`,
    //             property: `submitter_ids`,
    //             importedAs: SUBMITTER_PROPERTY
    //         }),
    //         [SUPPORTER_PROPERTY]: new UserImportHelper({
    //             repo: this.userRepo,
    //             verboseName: `Supporters`,
    //             property: `supporter_user_ids`,
    //             importedAs: SUPPORTER_PROPERTY
    //         })
    //     };
    // }

    // protected override pipeParseValue(value: string, header: keyof ViewMotion): any {
    //     if (header === TEXT_PROPERTY && value) {
    //         const isSurroundedByHTMLTags = /^<\w+[^>]*>[\w\W]*?<\/\w>$/.test(value);

    //         if (!isSurroundedByHTMLTags) {
    //             return `<p>${value.replace(/\n([ \t]*\n)+/g, `</p><p>`).replace(/\n/g, `<br />`)}</p>`;
    //         }
    //     }
    // }
}
