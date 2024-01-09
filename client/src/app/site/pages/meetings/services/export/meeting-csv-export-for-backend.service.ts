import { Injectable } from '@angular/core';
import {
    CsvColumnsDefinition,
    DEFAULT_COLUMN_SEPARATOR,
    DEFAULT_ENCODING,
    DEFAULT_LINE_SEPARATOR
} from 'src/app/gateways/export/csv-export.service';
import { CsvExportForBackendService } from 'src/app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { FileExportService } from 'src/app/gateways/export/file-export.service';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { MeetingSettingsService } from '../meeting-settings.service';
import { MeetingExportModule } from './meeting-export.module';

@Injectable({
    providedIn: MeetingExportModule
})
export class MeetingCsvExportForBackendService extends CsvExportForBackendService {
    public constructor(private meetingSettings: MeetingSettingsService) {
        super();
    }

    /**
     * Saves an array of model data to a CSV.
     * @param models Array of model instances to be saved
     * @param columns Column definitions
     * @param filename name of the resulting file
     * @param options optional:
     *      lineSeparator (defaults to \r\n windows style line separator),
     *      columnseparator defaults to configured option (',' , other values are ';', '\t' (tab), ' 'whitespace)
     */
    public override export<T extends BaseViewModel>(
        models: T[],
        columns: CsvColumnsDefinition<T>,
        filename: string,
        {
            lineSeparator = DEFAULT_LINE_SEPARATOR,
            columnSeparator = this.meetingSettings.instant(`export_csv_separator`) ?? DEFAULT_COLUMN_SEPARATOR,
            encoding = this.meetingSettings.instant(`export_csv_encoding`) ?? DEFAULT_ENCODING
        }: {
            lineSeparator?: string;
            columnSeparator?: string;
            encoding?: 'utf-8' | 'iso-8859-15';
        } = {}
    ): void {
        super.export(models, columns, filename, { lineSeparator, columnSeparator, encoding });
    }
}
