import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

import { MotionStatuteParagraphRepositoryService } from 'app/core/repositories/motions/motion-statute-paragraph-repository.service';
import { BaseImportService, ImportConfig } from 'app/core/ui-services/base-import.service';
import { MotionStatuteParagraph } from 'app/shared/models/motions/motion-statute-paragraph';
import { StatuteCsvExportService } from './statute-csv-export.service';
import { statuteHeadersAndVerboseNames } from '../modules/statute-paragraph/statute-paragraph.constants';

/**
 * Service for motion imports
 */
@Injectable({
    providedIn: 'root'
})
export class StatuteImportService extends BaseImportService<MotionStatuteParagraph> {
    /**
     * List of possible errors and their verbose explanation
     */
    public errorList = {
        Duplicates: 'A statute with this title already exists.'
    };

    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public requiredHeaderLength = 2;

    /**
     * Constructor. Defines the headers expected and calls the abstract class
     * @param repo: The repository for statuteparagraphs.
     * @param translate Translation service
     * @param papa External csv parser (ngx-papaparser)
     * @param matSnackBar snackBar to display import errors
     */
    public constructor(
        private repo: MotionStatuteParagraphRepositoryService,
        private exporter: StatuteCsvExportService,
        translate: TranslateService,
        papa: Papa,
        matSnackbar: MatSnackBar
    ) {
        super(translate, papa, matSnackbar);
    }

    public downloadCsvExample(): void {
        this.exporter.exportDummyCSV();
    }

    protected getConfig(): ImportConfig<any> {
        return {
            modelHeadersAndVerboseNames: statuteHeadersAndVerboseNames,
            hasDuplicatesFn: (entry: Partial<MotionStatuteParagraph>) =>
                this.repo.getViewModelList().some(paragraph => paragraph.title === entry.title),
            bulkCreateFn: (entries: any[]) => this.repo.bulkCreate(entries)
        };
    }
}
