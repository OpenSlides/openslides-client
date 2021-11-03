import { Injectable } from '@angular/core';
import { MotionStatuteParagraphRepositoryService } from 'app/core/repositories/motions/motion-statute-paragraph-repository.service';
import { BaseImportService, ImportConfig } from 'app/core/ui-services/base-import.service';
import { MotionStatuteParagraph } from 'app/shared/models/motions/motion-statute-paragraph';

import { ImportServiceCollector } from '../../../core/ui-services/import-service-collector';
import { statuteHeadersAndVerboseNames } from '../modules/statute-paragraph/statute-paragraph.constants';
import { StatuteCsvExportService } from './statute-csv-export.service';

/**
 * Service for motion imports
 */
@Injectable({
    providedIn: `root`
})
export class StatuteImportService extends BaseImportService<MotionStatuteParagraph> {
    /**
     * List of possible errors and their verbose explanation
     */
    public errorList = {
        Duplicates: `A statute with this title already exists.`
    };

    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public requiredHeaderLength = 2;

    /**
     * Constructor. Defines the headers expected and calls the abstract class
     */
    public constructor(
        private repo: MotionStatuteParagraphRepositoryService,
        private exporter: StatuteCsvExportService,
        serviceCollector: ImportServiceCollector
    ) {
        super(serviceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.exportDummyCSV();
    }

    protected getConfig(): ImportConfig<any> {
        return {
            modelHeadersAndVerboseNames: statuteHeadersAndVerboseNames,
            verboseNameFn: plural => this.repo.getVerboseName(plural),
            hasDuplicatesFn: (entry: Partial<MotionStatuteParagraph>) =>
                this.repo.getViewModelList().some(paragraph => paragraph.title === entry.title),
            createFn: (entries: any[]) => this.repo.bulkCreate(entries)
        };
    }
}
