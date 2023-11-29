import { Injectable } from '@angular/core';
import { Motion } from 'src/app/domain/models/motions/motion';
import { BeforeImportHandler } from 'src/app/infrastructure/utils/import/base-before-import-handler';
import { ImportConfig } from 'src/app/infrastructure/utils/import/import-utils';
import { UserImportHelper } from 'src/app/infrastructure/utils/import/users';
import { BaseImportService } from 'src/app/site/base/base-import.service';
import { MotionControllerService } from 'src/app/site/pages/meetings/pages/motions/services/common/motion-controller.service';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { ImportServiceCollectorService } from 'src/app/site/services/import-service-collector.service';

import { MotionCategoryControllerService } from '../../../modules/categories/services/motion-category-controller.service';
import { MotionBlockControllerService } from '../../../modules/motion-blocks/services/motion-block-controller.service';
import { TagControllerService } from '../../../modules/tags/services';
import { getMotionExportHeadersAndVerboseNames } from '../../../services/export/definitions';
import { MotionCsvExportService } from '../../../services/export/motion-csv-export.service';
import { ViewMotion } from '../../../view-models';
import { CategoryImportHelper } from '../import/category-import-helper';
import { MotionBlockImportHelper } from '../import/motion-block-import-helper';
import { TagImportHelper } from '../import/tag-import-helper';
import { MotionsImportServiceModule } from './motions-import-service.module';

const CATEGORY_PROPERTY = `category`;
const MOTION_BLOCK_PROPERTY = `motion_block`;
const TAG_PROPERTY = `tags`;
const TEXT_PROPERTY = `text`;
const SUBMITTER_PROPERTY = `submitters`;
const SUPPORTER_PROPERTY = `supporters`;

@Injectable({
    providedIn: MotionsImportServiceModule
})
export class MotionImportService extends BaseImportService<ViewMotion> {
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
        private categoryRepo: MotionCategoryControllerService,
        private motionBlockRepo: MotionBlockControllerService,
        private userRepo: ParticipantControllerService,
        private tagRepo: TagControllerService,
        private exporter: MotionCsvExportService
    ) {
        super(serviceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.exportDummyMotion();
    }

    protected getConfig(): ImportConfig<ViewMotion> {
        return {
            modelHeadersAndVerboseNames: getMotionExportHeadersAndVerboseNames(),
            verboseNameFn: plural => this.repo.getVerboseName(plural),
            getDuplicatesFn: (entry: Partial<Motion>) =>
                this.repo.getViewModelList().filter(motion => motion.number === entry.number),
            createFn: (entries: Motion[]) => this.repo.create(...entries)
        };
    }

    protected override getBeforeImportHelpers(): { [key: string]: BeforeImportHandler<ViewMotion> } {
        return {
            [MOTION_BLOCK_PROPERTY]: new MotionBlockImportHelper(this.motionBlockRepo, this.translate),
            [CATEGORY_PROPERTY]: new CategoryImportHelper(this.categoryRepo, this.translate),
            [TAG_PROPERTY]: new TagImportHelper(this.tagRepo),
            [SUBMITTER_PROPERTY]: new UserImportHelper({
                repo: this.userRepo,
                verboseName: `Submitters`,
                property: `submitter_ids`,
                importedAs: SUBMITTER_PROPERTY
            }),
            [SUPPORTER_PROPERTY]: new UserImportHelper({
                repo: this.userRepo,
                verboseName: `Supporters`,
                property: `supporter_user_ids`,
                importedAs: SUPPORTER_PROPERTY
            })
        };
    }

    protected override pipeParseValue(value: string, header: keyof ViewMotion): any {
        if (header === TEXT_PROPERTY && value) {
            const isSurroundedByHTMLTags = /^<\w+[^>]*>[\w\W]*?<\/\w>$/.test(value);

            if (!isSurroundedByHTMLTags) {
                return `<p>${value.replace(/\n([ \t]*\n)+/g, `</p><p>`).replace(/\n/g, `<br />`)}</p>`;
            }
        }
    }
}
