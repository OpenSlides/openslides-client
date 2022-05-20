import { Injectable } from '@angular/core';
import { MotionStatuteParagraph } from 'src/app/domain/models/motions/motion-statute-paragraph';
import { ImportConfig } from 'src/app/infrastructure/utils/import/import-utils';
import { BaseImportService } from 'src/app/site/base/base-import.service';
import { ImportServiceCollectorService } from 'src/app/site/services/import-service-collector.service';

import { MotionStatuteParagraphControllerService } from '../../../modules/statute-paragraphs/services';
import { statuteParagraphHeadersAndVerboseNames } from '../definitions/index';
import { StatuteParagraphCsvExportService } from './statute-paragraph-csv-export.service';
import { StatuteParagraphServiceModule } from './statute-paragraph-service.module';

@Injectable({
    providedIn: StatuteParagraphServiceModule
})
export class StatuteParagraphImportService extends BaseImportService<MotionStatuteParagraph> {
    /**
     * List of possible errors and their verbose explanation
     */
    public override errorList = {
        Duplicates: `A statute with this title already exists.`
    };

    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public override requiredHeaderLength = 2;

    /**
     * Constructor. Defines the headers expected and calls the abstract class
     */
    public constructor(
        private repo: MotionStatuteParagraphControllerService,
        private exporter: StatuteParagraphCsvExportService,
        serviceCollector: ImportServiceCollectorService
    ) {
        super(serviceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.exportDummyCSV();
    }

    protected getConfig(): ImportConfig<MotionStatuteParagraph> {
        return {
            modelHeadersAndVerboseNames: statuteParagraphHeadersAndVerboseNames,
            verboseNameFn: plural => this.repo.getVerboseName(plural),
            getDuplicatesFn: (entry: Partial<MotionStatuteParagraph>) =>
                this.repo.getViewModelList().filter(paragraph => paragraph.title === entry.title),
            createFn: (entries: any[]) => this.repo.create(...entries)
        };
    }
}
