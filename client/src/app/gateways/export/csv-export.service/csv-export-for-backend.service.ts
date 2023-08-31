import { Injectable } from '@angular/core';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { ExportServiceModule } from '../export-service.module';
import { FileExportService } from '../file-export.service';
import {
    CsvColumnsDefinition,
    DEFAULT_COLUMN_SEPARATOR,
    DEFAULT_ENCODING,
    DEFAULT_LINE_SEPARATOR,
    isMapDefinition,
    ISO_8859_15_ENCODING,
    isPropertyDefinition
} from './csv-export-utils';

@Injectable({
    providedIn: ExportServiceModule
})
export class CsvExportForBackendService {
    public constructor(private exporter: FileExportService) {}

    /**
     * Saves an array of model data to a CSV.
     * @param models Array of model instances to be saved
     * @param columns Column definitions
     * @param filename name of the resulting file
     * @param options optional:
     *      lineSeparator (defaults to \r\n windows style line separator),
     *      columnseparator defaults to configured option (',' , other values are ';', '\t' (tab), ' 'whitespace)
     */
    public export<T extends BaseViewModel>(
        models: T[],
        columns: CsvColumnsDefinition<T>,
        filename: string,
        {
            lineSeparator = DEFAULT_LINE_SEPARATOR,
            columnSeparator = DEFAULT_COLUMN_SEPARATOR,
            encoding = DEFAULT_ENCODING
        }: {
            lineSeparator?: string;
            columnSeparator?: string;
            encoding?: 'utf-8' | 'iso-8859-15';
        } = {}
    ): void {
        let csvContent = []; // Holds all lines as arrays with each column-value
        // initial array of usable text separators. The first character not used
        // in any text data or as column separator will be used as text separator

        if (lineSeparator === columnSeparator) {
            throw new Error(`lineseparator and columnseparator must differ from each other`);
        }

        // create header data
        const header = columns.map(column => {
            let label = ``;
            if (isPropertyDefinition(column)) {
                label = column.label ? column.label : (column.property as string);
            } else if (isMapDefinition(column)) {
                label = column.label;
            }
            return label;
        });
        csvContent.push(header);

        // create lines
        csvContent = csvContent.concat(
            models.map(model =>
                columns.map(column => {
                    let value = ``;

                    if (isPropertyDefinition(column)) {
                        const property: any = model[column.property];
                        if (typeof property === `number`) {
                            value = property.toString(10);
                        } else if (!property) {
                            value = ``;
                        } else if (property === true) {
                            value = `1`;
                        } else if (property === false) {
                            value = `0`;
                        } else if (typeof property === `function`) {
                            const bindedFn = property.bind(model); // bind model to access 'this'
                            value = bindedFn()?.toString();
                        } else {
                            value = property.toString();
                        }
                    } else if (isMapDefinition(column)) {
                        value = column.map(model);
                    }
                    return this.checkCsvTextSafety(value);
                })
            )
        );

        const csvContentAsString: string = csvContent
            .map((line: string[]) => line.join(columnSeparator))
            .join(lineSeparator);
        const filetype = `text/csv;charset=${encoding}`;
        if (encoding === ISO_8859_15_ENCODING) {
            this.exporter.saveFile(this.convertTo8859_15(csvContentAsString), filename, filetype);
        } else {
            this.exporter.saveFile(csvContentAsString, filename, filetype);
        }
    }

    public dummyCSVExport<I>(headerAndVerboseNames: I, rows: I[], filename: string): void {
        const separator = DEFAULT_COLUMN_SEPARATOR;
        const encoding: `utf-8` | `iso-8859-15` = DEFAULT_ENCODING as any;
        const headerRow = [Object.keys(headerAndVerboseNames).join(separator)];
        const content = rows.map(row =>
            Object.keys(headerAndVerboseNames)
                .map(key => {
                    let value = row[key as keyof I] || ``;
                    if (typeof value === `number`) {
                        value = value.toString(10);
                    } else if (typeof value === `boolean`) {
                        value = value ? `1` : `0`;
                    }
                    return this.checkCsvTextSafety(value as string);
                })
                .join(separator)
        );
        const csv = headerRow.concat(content).join(`\r\n`);
        const toExport = encoding === ISO_8859_15_ENCODING ? this.convertTo8859_15(csv) : csv;
        this.exporter.saveFile(toExport, filename, `text/csv`);
    }

    /**
     * Ensures, that the given string has escaped double quotes
     * and no linebreak. The string itself will also be escaped by `double quotes`.
     *
     * @param {string} input any input to be sent to CSV
     * @returns {string} the cleaned string.
     */
    public checkCsvTextSafety(input: string): string {
        if (!input) {
            return ``;
        }
        return `"` + input.replace(/"/g, `""`).replace(/(\r\n\t|\n|\r\t)/gm, ``) + `"`;
    }

    /**
     * get an iso-8859-15 - compatible blob part
     *
     * @param data
     * @returns a Blob part
     */
    private convertTo8859_15(data: string): BlobPart {
        const array = new Uint8Array(new ArrayBuffer(data.length));
        for (let i = 0; i < data.length; i++) {
            array[i] = data.charCodeAt(i);
        }
        return array;
    }
}
