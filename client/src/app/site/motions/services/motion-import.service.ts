import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { BaseImportService, ImportConfig } from 'app/core/ui-services/base-import.service';
import { Motion } from 'app/shared/models/motions/motion';
import { CategoryImportHelper } from '../import/category-import-helper';
import { ImportHelper } from '../../common/import/import-helper';
import { MotionBlockImportHelper } from '../import/motion-block-import-helper';
import { MotionCsvExportService } from './motion-csv-export.service';
import { getMotionExportHeadersAndVerboseNames, motionExpectedHeaders } from '../motions.constants';
import { TagImportHelper } from '../import/tag-import-helper';
import { UserImportHelper } from '../import/user-import-helper';

const CATEGORY_PROPERTY = 'category';
const MOTION_BLOCK_PROPERTY = 'motion_block';
const TAG_PROPERTY = 'tags';
const SUBMITTER_PROPERTY = 'submitters';
const SUPPORTER_PROPERTY = 'supporters';

/**
 * Service for motion imports
 */
@Injectable({
    providedIn: 'root'
})
export class MotionImportService extends BaseImportService<Motion> {
    /**
     * List of possible errors and their verbose explanation
     */
    public errorList = {
        MotionBlock: 'Could not resolve the motion block',
        Category: 'Could not resolve the category',
        Submitters: 'Could not resolve the submitters',
        Tags: 'Could not resolve the tags',
        Title: 'A title is required',
        Text: "A content in the 'text' column is required",
        Duplicates: 'A motion with this number already exists.'
    };

    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public requiredHeaderLength = 3;

    /**
     * Constructor. Defines the headers expected and calls the abstract class
     * @param repo: The repository for motions.
     * @param categoryRepo Repository to fetch pre-existing categories
     * @param motionBlockRepo Repository to fetch pre-existing motionBlocks
     * @param userRepo Repository to query/ create users
     * @param translate Translation service
     * @param papa External csv parser (ngx-papaparser)
     * @param matSnackBar snackBar to display import errors
     */
    public constructor(
        private repo: MotionRepositoryService,
        private categoryRepo: MotionCategoryRepositoryService,
        private motionBlockRepo: MotionBlockRepositoryService,
        private userRepo: UserRepositoryService,
        private tagRepo: TagRepositoryService,
        private exporter: MotionCsvExportService,
        translate: TranslateService,
        papa: Papa,
        matSnackbar: MatSnackBar
    ) {
        super(translate, papa, matSnackbar);
    }

    public downloadCsvExample(): void {
        this.exporter.exportDummyMotion();
    }

    protected getConfig(): ImportConfig {
        return {
            modelHeadersAndVerboseNames: getMotionExportHeadersAndVerboseNames(),
            hasDuplicatesFn: (entry: Partial<Motion>) =>
                this.repo.getViewModelList().some(motion => motion.number === entry.number),
            bulkCreateFn: (entries: Motion[]) => this.repo.bulkCreate(entries)
        };
    }

    protected getImportHelpers(): { [key: string]: ImportHelper<Motion> } {
        return {
            [MOTION_BLOCK_PROPERTY]: new MotionBlockImportHelper(this.motionBlockRepo, this.translate),
            [CATEGORY_PROPERTY]: new CategoryImportHelper(this.categoryRepo, this.translate),
            [TAG_PROPERTY]: new TagImportHelper(this.tagRepo),
            [SUBMITTER_PROPERTY]: new UserImportHelper(this.userRepo, 'Submitters', 'submitter_ids'),
            [SUPPORTER_PROPERTY]: new UserImportHelper(this.userRepo, 'Supporters', 'supporter_ids')
        };
    }
}
