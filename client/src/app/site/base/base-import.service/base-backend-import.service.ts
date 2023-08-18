import { Directive } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Papa, ParseConfig } from 'ngx-papaparse';
import { BehaviorSubject, Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { FileReaderProgressEvent, ValueLabelCombination } from 'src/app/infrastructure/utils/import/import-utils';
import { BackendImportService } from 'src/app/ui/base/import-service';
import { BackendImportPhase } from 'src/app/ui/modules/import-list/components/via-backend-import-list/backend-import-list.component';
import {
    BackendImportPreview,
    BackendImportRawPreview,
    BackendImportState,
    isBackendImportRawPreview
} from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

import { ImportServiceCollectorService } from '../../services/import-service-collector.service';

@Directive()
export abstract class BaseBackendImportService<MainModel extends Identifiable>
    implements BackendImportService<MainModel>
{
    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public requiredHeaderLength = 2;

    /**
     * The used column separator. If left on an empty string (default),
     * the papaparse parser will automatically decide on separators.
     */
    public columnSeparator = ``;

    /**
     * The used text separator.
     */
    public textSeparator = `"`;

    /**
     * The encoding used by the FileReader object.
     */
    public encoding = `utf-8`;

    /**
     * List of possible encodings and their label. values should be values accepted
     * by the FileReader API
     */
    public encodings: ValueLabelCombination[] = [
        { value: `utf-8`, label: `UTF 8 - Unicode` },
        { value: `iso-8859-1`, label: `ISO 8859-1 - West European` },
        { value: `iso-8859-15`, label: `ISO 8859-15 - West European (with €)` }
    ];

    /**
     * List of possible column separators to pass on to papaParse
     */
    public columnSeparators: ValueLabelCombination[] = [
        { label: `Comma`, value: `,` },
        { label: `Semicolon`, value: `;` },
        { label: `Automatic`, value: `` }
    ];

    /**
     * List of possible text separators to pass on to papaParse. Note that
     * it cannot automatically detect textseparators (value must not be an empty string)
     */
    public textSeparators: ValueLabelCombination[] = [
        { label: `Double quotes (")`, value: `"` },
        { label: `Single quotes (')`, value: `'` },
        { label: `Gravis (\`)`, value: `\`` }
    ];

    /**
     * Observable that allows one to monitor the currenty selected file.
     */
    public get rawFileObservable(): Observable<File | null> {
        return this._rawFileSubject;
    }

    /**
     * Action worker ids that will trigger the currently previewed import.
     */
    public get previewActionIds(): number[] {
        return this._previewActionIds;
    }

    /**
     * If false there is something wrong with the data.
     */
    public get previewHasRowErrors(): boolean {
        return this._previews?.some(preview => preview.state === BackendImportState.Error) ?? false;
    }

    /**
     * Observable that passes updates on the current preview.
     */
    public get previewsObservable(): Observable<BackendImportPreview[] | null> {
        return this._previewsSubject as Observable<BackendImportPreview[] | null>;
    }

    /**
     * Observable that allows one to monitor the part of the import that is currently in process.
     */
    public get currentImportPhaseObservable(): Observable<BackendImportPhase> {
        return this._currentImportPhaseSubject as Observable<BackendImportPhase>;
    }

    /**
     * List of possible errors and their verbose explanation.
     */
    protected abstract readonly errorList: { [errorKey: string]: string };

    /**
     * List of possible errors and their verbose explanation.
     */
    private readonly verboseGeneralErrors: { [errorKey: string]: string } = {
        [`Duplicate`]: `Is a duplicate`
    };

    protected readonly translate: TranslateService = this.importServiceCollector.translate;
    protected readonly matSnackbar: MatSnackBar = this.importServiceCollector.matSnackBar;

    /**
     * Overwrite in subclass to define verbose titles for the ones sent by the backend
     */
    protected readonly verboseSummaryTitles: { [title: string]: string } = {};

    private set previews(preview: BackendImportPreview[] | null) {
        this._previews = preview;
        this._previewActionIds = this._previews?.map(result => result.id) ?? [];
        this._previewsSubject.next(preview);
    }

    private _previews: BackendImportPreview[] | null = null;

    private _previewsSubject = new BehaviorSubject<BackendImportPreview[] | null>(null);

    private _previewActionIds: number[] = [];

    /**
     * The last parsed file object (may be reparsed with new encoding, thus kept in memory)
     */
    private _rawFile: File | null = null;

    private _rawFileSubject = new BehaviorSubject<File | null>(null);

    /**
     * FileReader object for file import
     */
    private _reader = new FileReader();

    private _currentImportPhaseSubject = new BehaviorSubject<BackendImportPhase>(BackendImportPhase.LOADING_PREVIEW);

    /**
     * the list of parsed models that have been extracted from the opened file or inserted manually
     */
    private _csvLines: { [header: string]: string }[] = [];
    private _receivedHeaders: string[] = [];
    private readonly _papa: Papa = this.importServiceCollector.papa;

    /**
     * Constructor. Creates a fileReader to subscribe to it for incoming parsed
     * strings
     */
    public constructor(private importServiceCollector: ImportServiceCollectorService) {
        this._reader.onload = (event: FileReaderProgressEvent) => {
            this.parseInput(event.target?.result as string);
        };
    }

    /**
     * Parses the data input. Expects a string as returned by via a File.readAsText() operation
     *
     * @param file
     */
    public parseInput(file: string): void {
        this.clearPreview();
        const papaConfig: ParseConfig = {
            header: true,
            skipEmptyLines: `greedy`,
            quoteChar: this.textSeparator,
            transform: (value, columnOrHeader) => (!value ? undefined : value)
        };
        if (this.columnSeparator) {
            papaConfig.delimiter = this.columnSeparator;
        }
        const result = this._papa.parse(file, papaConfig);
        this._csvLines = result.data;
        this.parseCsvLines();
    }

    /**
     * Clears the current File (and the preview along with it)
     */
    public clearFile(): void {
        this.clearPreview();
        this._rawFile = null;
        this._rawFileSubject.next(null);
    }

    /**
     * Adds new csv lines onto the end of and then updates the preview.
     *
     * @param lines should conform to the format expected by the backend.
     */
    public addLines(...lines: { [header: string]: any }[]): void {
        for (const line of lines) {
            this._csvLines.push(line);
        }
        this.parseCsvLines();
    }

    /**
     * Handler after a file was selected. Basic checking for type, then hand
     * over to parsing
     *
     * @param event type is Event, but has target.files, which typescript doesn't seem to recognize
     */
    public onSelectFile(event: any): void {
        if (event.target.files && event.target.files.length === 1) {
            this._rawFile = event.target.files[0];
            this._rawFileSubject.next(this._rawFile);
            this.readFile();
        }
    }

    /**
     * Rereads the (previously selected) file, if present. Thought to be triggered
     * by parameter changes on encoding, column, text separators
     */
    public refreshFile(): void {
        if (this._rawFile) {
            this.readFile();
        }
    }

    /**
     * Resets the data and preview (triggered upon selecting an invalid file)
     */
    public clearPreview(): void {
        if (this.previewActionIds?.length && this._currentImportPhaseSubject.value !== BackendImportPhase.FINISHED) {
            this.import(this.previewActionIds, true); // Delete the suspended action worker from the backend
        }
        this._currentImportPhaseSubject.next(BackendImportPhase.LOADING_PREVIEW);
        this.previews = null;
    }

    /**
     * Resets the service to starting condition.
     */
    public clearAll(): void {
        this._csvLines = [];
        this.clearFile();
    }

    /**
     * Get an extended error description.
     *
     * @param error
     * @returns the extended error desription for that error
     */
    public verbose(error: string): string {
        return this.errorList[error] || this.verboseGeneralErrors[error] || error;
    }

    /**
     * Matches the summary titles from the backend to more verbose versions that should be displayed instead.
     */
    public getVerboseSummaryPointTitle(title: string): string {
        const verbose = (this.verboseSummaryTitles[title] ?? title).trim();
        return verbose.charAt(0).toUpperCase() + verbose.slice(1);
    }

    /**
     * Executing the import.
     * @returns true if the import finished successfully
     */
    public async doImport(): Promise<boolean> {
        this._currentImportPhaseSubject.next(BackendImportPhase.IMPORTING);

        const results = await this.import(this.previewActionIds, false);

        if (Array.isArray(results) && results.find(result => isBackendImportRawPreview(result))) {
            const updatedPreviews = results.filter(result =>
                isBackendImportRawPreview(result)
            ) as BackendImportRawPreview[];
            this.processRawPreviews(updatedPreviews);
            if (this.previewHasRowErrors) {
                this._currentImportPhaseSubject.next(BackendImportPhase.ERROR);
            } else {
                this._currentImportPhaseSubject.next(BackendImportPhase.TRY_AGAIN);
            }
        } else {
            this._currentImportPhaseSubject.next(BackendImportPhase.FINISHED);
            this._csvLines = [];
            return true;
        }
        return false;
    }

    /**
     * Calculates the payload for the jsonUpload function.
     * Should be overridden by sub-classes if the upload needs to be more specific.
     * F.e. if it is a meeting import and a meeting id needs to be given additionally
     */
    protected calculateJsonUploadPayload(): { [key: string]: any } {
        return {
            data: this._csvLines
        };
    }

    private parseCsvLines(): void {
        this._receivedHeaders = Object.keys(this._csvLines[0]);
        const isValid = this.checkHeaderLength();
        if (!isValid) {
            return;
        }
        this.propagateNextNewEntries();
    }

    /**
     * reads the _rawFile
     */
    private readFile(): void {
        if (this._rawFile) {
            this._reader.readAsText(this._rawFile, this.encoding);
        }
    }

    /**
     * Checks the first line of the csv (the header) for consistency (length)
     *
     * @returns true if the line has at least the minimum amount of columns
     */
    private checkHeaderLength(): boolean {
        const snackbarDuration = 3000;
        if (this._receivedHeaders.length < this.requiredHeaderLength) {
            this.matSnackbar.open(this.translate.instant(`The file has too few columns to be parsed properly.`), ``, {
                duration: snackbarDuration
            });

            this.clearPreview();
            return false;
        }
        return true;
    }

    private async propagateNextNewEntries(): Promise<void> {
        this.clearPreview();
        const payload = this.calculateJsonUploadPayload();
        const response = (await this.jsonUpload(payload)) as BackendImportRawPreview[];
        if (!response) {
            throw new Error(`Didn't receive preview`);
        }
        this.processRawPreviews(response);
        if (this.previewHasRowErrors) {
            this._currentImportPhaseSubject.next(BackendImportPhase.ERROR);
        } else {
            this._currentImportPhaseSubject.next(BackendImportPhase.AWAITING_CONFIRM);
        }
    }

    private processRawPreviews(rawPreviews: BackendImportRawPreview[]): void {
        const previews: (BackendImportRawPreview | BackendImportPreview)[] = rawPreviews;
        let index = 1;
        for (const preview of previews) {
            for (const row of preview.rows) {
                row[`id`] = index;
                index++;
            }
        }

        this.previews = previews as BackendImportPreview[];
    }

    // Abstract methods

    /**
     * Allows the user to download an example csv file.
     */
    public abstract downloadCsvExample(): void;
    /**
     * Calls the relevant json_upload backend action with the payload.
     */
    protected abstract jsonUpload(payload: { [key: string]: any }): Promise<void | BackendImportRawPreview[]>;
    /**
     * Calls the relevant import backend action with the payload.
     *
     * If abort is set to true, the import should be aborted,
     * i.e. the data should NOT be imported, but instead the action worker should be deleted.
     */
    protected abstract import(
        actionWorkerIds: number[],
        abort?: boolean
    ): Promise<void | (BackendImportRawPreview | void)[]>;
}
