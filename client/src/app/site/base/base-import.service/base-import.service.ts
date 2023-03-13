import { Directive, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Papa, ParseConfig } from 'ngx-papaparse';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { Identifiable } from '../../../domain/interfaces';
import {
    AdditionalImportHandler,
    BaseAdditionalImportHandler
} from '../../../infrastructure/utils/import/base-additional-import-handler';
import {
    AfterImportHandler,
    BaseAfterImportHandler
} from '../../../infrastructure/utils/import/base-after-import-handler';
import {
    BaseBeforeImportHandler,
    BeforeImportHandler
} from '../../../infrastructure/utils/import/base-before-import-handler';
import { ImportHandler } from '../../../infrastructure/utils/import/base-import-handler';
import {
    BaseMainImportHandler,
    MainImportHandler
} from '../../../infrastructure/utils/import/base-main-import-handler';
import { ImportModel } from '../../../infrastructure/utils/import/import-model';
import { ImportStep, ImportStepPhase } from '../../../infrastructure/utils/import/import-step';
import {
    CsvJsonMapping,
    CsvValueParsingConfig,
    DUPLICATE_IMPORT_ERROR,
    FileReaderProgressEvent,
    hasBeforeFindAction,
    ImportConfig,
    ImportCSVPreview,
    RawImportModel,
    ValueLabelCombination
} from '../../../infrastructure/utils/import/import-utils';
import {
    StaticAdditionalImportHandler,
    StaticAdditionalImportHandlerConfig
} from '../../../infrastructure/utils/import/static-additional-import-handler';
import {
    StaticAfterImportConfig,
    StaticAfterImportHandler
} from '../../../infrastructure/utils/import/static-after-import-handler';
import { StaticBeforeImportConfig } from '../../../infrastructure/utils/import/static-before-import-config';
import { StaticBeforeImportHandler } from '../../../infrastructure/utils/import/static-before-import-handler';
import {
    StaticMainImportConfig,
    StaticMainImportHandler
} from '../../../infrastructure/utils/import/static-main-import-handler';
import { ImportService } from '../../../ui/base/import-service';
import { ImportServiceCollectorService } from '../../services/import-service-collector.service';

@Directive()
export abstract class BaseImportService<MainModel extends Identifiable> implements ImportService<MainModel> {
    public chunkSize = 100;

    /**
     * List of possible errors and their verbose explanation
     */
    public errorList: { [errorKey: string]: string } = {};

    /**
     * The headers expected in the CSV matching import properties (in order)
     */
    public expectedHeaders: string[] = [];

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

    public get currentImportPhaseObservable(): Observable<ImportStepPhase> {
        return this._currentImportPhaseSubject.asObservable();
    }

    public get isImportValidObservable(): Observable<boolean> {
        return this._isImportValidSubject.asObservable();
    }

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
     * Emits an error string to display if a file import cannot be done
     */
    public errorEvent = new EventEmitter<string>();

    /**
     * Returns a summary on actions that will be taken/not taken.
     */
    public get summary(): ImportCSVPreview {
        if (!this._preview) {
            this.updatePreview();
        }
        return this._preview!;
    }

    public get importingStepsObservable(): Observable<ImportStep[]> {
        return this._importingStepsSubject.asObservable();
    }

    public get leftReceivedHeaders(): string[] {
        return this._lostHeaders.received;
    }

    public get leftExpectedHeaders(): { [key: string]: string } {
        return this._lostHeaders.expected;
    }

    public get headerValues(): { [header: string]: string } {
        return this._mapReceivedExpectedHeaders;
    }

    public get rawFileObservable(): Observable<File | null> {
        return this._rawFileSubject.asObservable();
    }

    private get importModels(): ImportModel<MainModel>[] {
        return Object.values(this._newEntries.value);
    }

    /**
     * BehaviorSubject for displaying a preview for the currently selected entries
     */
    private readonly _newEntries = new BehaviorSubject<{ [importTrackId: number]: ImportModel<MainModel> }>({});

    /**
     * storing the summary preview for the import, to avoid recalculating it
     * at each display change.
     */
    private _preview: ImportCSVPreview | null = null;

    private _beforeImportHandler: { [key: string]: { mainHandler: BeforeImportHandler } } = {};
    private _afterImportHandler: {
        [key: string]: { mainHandler: AfterImportHandler; additionalHandlers: AdditionalImportHandler[] };
    } = {};
    private _otherMainImportHelper: MainImportHandler[] = [];

    private _modelHeadersAndVerboseNames: { [key: string]: string } = {};

    private _getDuplicatesFn:
        | ((entry: RawImportModel<MainModel>) => Partial<MainModel>[] | Promise<Partial<MainModel>[]>)
        | undefined;

    protected readonly translate: TranslateService = this.importServiceCollector.translate;
    protected readonly matSnackbar: MatSnackBar = this.importServiceCollector.matSnackBar;

    /**
     * The last parsed file object (may be reparsed with new encoding, thus kept in memory)
     */
    private _rawFile: File | null = null;

    private _rawFileSubject = new BehaviorSubject<File | null>(null);

    /**
     * FileReader object for file import
     */
    private _reader = new FileReader();

    private _importingStepsSubject = new BehaviorSubject<ImportStep[]>([]);
    private _currentImportPhaseSubject = new BehaviorSubject<ImportStepPhase>(ImportStepPhase.ENQUEUED);
    private _isImportValidSubject = new BehaviorSubject<boolean>(false);

    /**
     * the list of parsed models that have been extracted from the opened file
     */
    private _csvLines: { [header: string]: string }[] = [];
    private _receivedHeaders: string[] = [];
    private _mapReceivedExpectedHeaders: { [expectedHeader: string]: string } = {};
    private _requiredFields: (keyof MainModel)[] = [];
    private _lostHeaders: { expected: { [header: string]: string }; received: string[] } = {
        expected: {},
        received: []
    };

    private _selfImportHelper: MainImportHandler<MainModel> | null = null;

    private readonly _papa: Papa = this.importServiceCollector.papa;

    /**
     * Constructor. Creates a fileReader to subscribe to it for incoming parsed
     * strings
     */
    public constructor(private importServiceCollector: ImportServiceCollectorService) {
        this._reader.onload = (event: FileReaderProgressEvent) => {
            this.parseInput(event.target?.result as string);
        };
        this.init();
    }

    /**
     * Parses the data input. Expects a string as returned by via a File.readAsText() operation
     *
     * @param file
     */
    public parseInput(file: string): void {
        this.init();
        this.clearPreview();
        const papaConfig: ParseConfig = {
            header: true,
            skipEmptyLines: `greedy`,
            quoteChar: this.textSeparator
        };
        if (this.columnSeparator) {
            papaConfig.delimiter = this.columnSeparator;
        }
        const result = this._papa.parse(file, papaConfig);
        this._csvLines = result.data;
        this.parseCsvLines();
    }

    public clearFile(): void {
        this.setParsedEntries({});
        this._rawFile = null;
        this._rawFileSubject.next(null);
    }

    public addLines(...lines: { [header: string]: any }[]): void {
        for (const line of lines) {
            this._csvLines.push(line);
        }
        this.parseCsvLines();
    }

    /**
     * counts the amount of duplicates that have no decision on the action to
     * be taken
     */
    public updatePreview(): void {
        const summary = {
            total: 0,
            new: 0,
            duplicates: 0,
            errors: 0,
            done: 0
        };
        this.importModels.forEach(entry => {
            summary.total += 1;
            if (entry.status === `done`) {
                summary.done += 1;
                return;
            } else if (entry.status === `error` && !entry.hasDuplicates) {
                // errors that are not due to duplicates
                summary.errors += 1;
                return;
            } else if (entry.hasDuplicates) {
                summary.duplicates += 1;
                return;
            } else if (entry.status === `new`) {
                summary.new += 1;
            }
        });
        this._preview = summary;
    }

    public updateSummary(): void {
        this._importingStepsSubject.next(this.getEveryImportHandler());
    }

    /**
     * a subscribable representation of the new items to be imported
     *
     * @returns an observable BehaviorSubject
     */
    public getNewEntriesObservable(): Observable<ImportModel<MainModel>[]> {
        return this._newEntries.asObservable().pipe(map(value => Object.values(value)));
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
        this.getEveryImportHandler().forEach(handler => handler.doCleanup());
        this.setNextEntries({});
        this._lostHeaders = { expected: {}, received: [] };
        this._preview = null;
        this._currentImportPhaseSubject.next(ImportStepPhase.ENQUEUED);
        this._isImportValidSubject.next(false);
    }

    /**
     * set a list of short names for error, indicating which column failed
     */
    private getVerboseError(error: string): string {
        return this.errorList[error] ?? error;
    }

    /**
     * Get an extended error description.
     *
     * @param error
     * @returns the extended error desription for that error
     */
    public verbose(error: string): string {
        return this.errorList[error] || error;
    }

    /**
     * Queries if a given error is present in the given entry
     *
     * @param entry the entry to check for the error.
     * @param error The error to check for
     * @returns true if the error is present
     */
    public hasError(entry: ImportModel<MainModel>, error: string): boolean {
        return entry.errors.includes(error);
    }

    /**
     * Executing the import. Creates all secondary data, maps the newly created
     * secondary data to the new entries, then creates all entries without errors
     * by submitting them to the server. The entries will receive the status
     * 'done' on success.
     */
    public async doImport(): Promise<void> {
        this._currentImportPhaseSubject.next(ImportStepPhase.PENDING);
        await this.doBeforeImport();

        for (const handler of this.getEveryMainImportHandler()) {
            handler.startImport();
            await handler.doImport();
            handler.finishImport();
        }

        await this.doAfterImport();

        this._currentImportPhaseSubject.next(ImportStepPhase.FINISHED);
        this.updatePreview();
    }

    private async doBeforeImport(): Promise<void> {
        for (const { mainHandler } of Object.values(this._beforeImportHandler)) {
            await mainHandler.doImport();
        }
    }

    private async doAfterImport(): Promise<void> {
        for (const { mainHandler, additionalHandlers } of Object.values(this._afterImportHandler)) {
            await mainHandler.doImport();
            for (const handler of additionalHandlers) {
                handler.pipeImportedSideModels(mainHandler.getModelsToCreate());
                await handler.doImport();
            }
        }
    }

    public setNewHeaderValue(updateMapReceivedExpectedHeaders: { [headerKey: string]: string }): void {
        for (const headerKey of Object.keys(updateMapReceivedExpectedHeaders)) {
            this._mapReceivedExpectedHeaders[headerKey] = updateMapReceivedExpectedHeaders[headerKey];
            delete this._lostHeaders.expected[headerKey];
            this.leftReceivedHeaders.splice(
                this.leftReceivedHeaders.findIndex(header => header === updateMapReceivedExpectedHeaders[headerKey]),
                1
            );
        }
        this.checkImportValidness();
        this.propagateNextNewEntries();
    }

    private setNextEntries(nextEntries: { [importTrackId: number]: ImportModel<MainModel> }): void {
        this._newEntries.next(nextEntries);
        this.updatePreview();
    }

    /**
     * A helper function to specify import-helpers for `ToCreate`.
     * Should be overriden to specify the import-helpers.
     *
     * @returns A map containing import-helpers for specific attributes of `ToCreate`.
     */
    protected getBeforeImportHelpers(): { [key: string]: BeforeImportHandler<MainModel, any> } {
        return {};
    }

    protected pipeParseValue(_value: string, _header: keyof MainModel): any {}

    protected registerBeforeImportHandler<ToImport>(
        header: string,
        handler: StaticBeforeImportConfig<MainModel, ToImport> | BaseBeforeImportHandler
    ): void {
        if (handler instanceof BaseBeforeImportHandler) {
            this._beforeImportHandler[header] = { mainHandler: handler };
        } else {
            this._beforeImportHandler[header] = {
                mainHandler: new StaticBeforeImportHandler(handler, key => this.translate.instant(key))
            };
        }
    }

    protected registerAfterImportHandler<SideModel>(
        header: string,
        handler: StaticAfterImportConfig<MainModel, SideModel> | BaseAfterImportHandler,
        additionalHandlers?: (
            | StaticAdditionalImportHandlerConfig<MainModel, SideModel>
            | BaseAdditionalImportHandler<MainModel, SideModel>
        )[]
    ): void {
        const getAfterImportHandler = (
            _handler:
                | StaticAdditionalImportHandlerConfig<MainModel, SideModel>
                | BaseAdditionalImportHandler<MainModel, SideModel>
        ) => {
            if (_handler instanceof BaseAdditionalImportHandler) {
                return _handler;
            } else {
                return new StaticAdditionalImportHandler<MainModel, SideModel>({
                    ..._handler,
                    translateFn: key => this.translate.instant(key)
                });
            }
        };
        const _additionalHandlers = (additionalHandlers ?? []).map(_handler => getAfterImportHandler(_handler));
        if (handler instanceof BaseAfterImportHandler) {
            this._afterImportHandler[header] = { mainHandler: handler, additionalHandlers: _additionalHandlers };
        } else {
            this._afterImportHandler[header] = {
                mainHandler: new StaticAfterImportHandler<MainModel, SideModel>(
                    handler,
                    header as keyof MainModel,
                    toTranslate => this.translate.instant(toTranslate)
                ),
                additionalHandlers: _additionalHandlers
            };
        }
    }

    protected registerMainImportHandler(
        handler: StaticMainImportConfig<MainModel> | BaseMainImportHandler<MainModel>
    ): void {
        if (handler instanceof BaseMainImportHandler) {
            this._otherMainImportHelper.push(handler);
        } else {
            this._otherMainImportHelper.push(
                new StaticMainImportHandler({
                    translateFn: key => this.translate.instant(key),
                    resolveEntryFn: importModel => this.resolveEntry(importModel),
                    ...handler
                })
            );
        }
    }

    protected async onCreateImportModel(input: RawImportModel<MainModel>): Promise<ImportModel<MainModel>> {
        if (!this._getDuplicatesFn) {
            throw new Error(`No function to check for duplicates defined`);
        }
        const duplicates = await this._getDuplicatesFn(input);
        const hasDuplicates = duplicates.length > 0;
        const entry: ImportModel<MainModel> = new ImportModel({
            model: input.model as MainModel,
            id: input.id,
            hasDuplicates,
            duplicates
        });
        return entry;
    }

    /**
     * This function pipes received rows from a csv file already mapped to their internal used data structure.
     * This is done, before import models are created from those rows. Thus, this function facilitates to decide
     * how import models are created depending on the rows in the csv file.
     *
     * @param _entries
     */
    protected async onBeforeCreatingImportModels(_entries: RawImportModel<MainModel>[]): Promise<void> {}

    private async createImportModel(
        input: RawImportModel<MainModel>,
        errors: string[] = []
    ): Promise<ImportModel<MainModel>> {
        const nextEntry = await this.onCreateImportModel(input);
        if (nextEntry.hasDuplicates) {
            errors.push(DUPLICATE_IMPORT_ERROR);
        }
        if (errors.length) {
            nextEntry.errors = errors.map(error => this.getVerboseError(error));
            nextEntry.status = `error`;
        }
        return nextEntry;
    }

    /**
     * Maps the value in one csv line for every header to the header, which is later used for models that will be created or updated.
     * These headers are specified in `_mapReceivedExpectedHeader`.
     *
     * @param line a csv line
     *
     * @returns an object which has the headers of the models used internal
     */
    private createRawImportModel(line: CsvJsonMapping, index: number): RawImportModel<MainModel> {
        const rawObject = Object.keys(this._mapReceivedExpectedHeaders).mapToObject(expectedHeader => {
            const receivedHeader = this._mapReceivedExpectedHeaders[expectedHeader];
            return { [expectedHeader]: line[receivedHeader] };
        });
        return {
            id: index,
            model: rawObject as MainModel
        };
    }

    private parseCsvLines(): void {
        this._receivedHeaders = Object.keys(this._csvLines[0]);
        const isValid = this.checkHeaderLength();
        this.checkReceivedHeaders();
        if (!isValid) {
            return;
        }
        this.propagateNextNewEntries();
        this.updateSummary();
    }

    /**
     * parses pre-prepared entries (e.g. from a textarea) instead of a csv structure
     *
     * @param entries: an array of prepared newEntry objects
     */
    private setParsedEntries(entries: { [importTrackId: number]: ImportModel<MainModel> }): void {
        this.clearPreview();
        if (!entries) {
            return;
        }
        this.setNextEntries(entries);
    }

    /**
     * Maps incoming data of probably manual typed headers and values into headers, used by the rest of an import
     * process.
     *
     * @param line An incoming header <-> value map
     * @param importTrackId The number of an import object
     *
     * @returns A new model which values are linked to any helpers if needed.
     */
    private mapData(importModel: ImportModel<MainModel>): void {
        const rawObject = importModel.model;
        const errors = [];
        for (const expectedHeader of Object.keys(this._mapReceivedExpectedHeaders)) {
            const handler = this._beforeImportHandler[expectedHeader] || this._afterImportHandler[expectedHeader];
            const csvValue = rawObject[expectedHeader as keyof MainModel] as any;
            try {
                const value = this.parseCsvValue(csvValue, {
                    header: expectedHeader as keyof MainModel,
                    importModel: importModel,
                    importFindHandler: handler?.mainHandler,
                    allImportModels: this.importModels
                });
                rawObject[expectedHeader as keyof MainModel] = value;
            } catch (e) {
                console.debug(`Error while parsing ${expectedHeader}\n`, e);
                errors.push((e as any).message);
                rawObject[expectedHeader as keyof MainModel] = csvValue;
            }
        }
        importModel.errors = importModel.errors.concat(errors);
    }

    private init(): void {
        const config = this.getConfig();
        this.expectedHeaders = Object.keys(config.modelHeadersAndVerboseNames);
        this._modelHeadersAndVerboseNames = config.modelHeadersAndVerboseNames;
        this._getDuplicatesFn = config.getDuplicatesFn;
        this._requiredFields = config.requiredFields || [];
        this.initializeImportHelpers();
    }

    private getSelfImportHelper(): MainImportHandler<MainModel> {
        return this._selfImportHelper!;
    }

    private initializeImportHelpers(): void {
        const { createFn, updateFn, getDuplicatesFn, verboseNameFn, shouldCreateModelFn } = this.getConfig();
        const handlers = Object.entries(this.getBeforeImportHelpers()).mapToObject(([key, value]) => ({
            [key]: { mainHandler: value }
        }));
        this._beforeImportHandler = { ...this._beforeImportHandler, ...handlers };
        this._selfImportHelper = new StaticMainImportHandler({
            verboseNameFn,
            getDuplicatesFn,
            shouldCreateModelFn,
            createFn,
            updateFn,
            translateFn: key => this.translate.instant(key),
            resolveEntryFn: importModel => this.resolveEntry(importModel)
        });
        this.updateSummary();
    }

    private resolveEntry(entry: ImportModel<MainModel>): MainModel {
        let model = { ...entry.newEntry } as MainModel;
        for (const key of Object.keys(this._beforeImportHandler)) {
            const { mainHandler: handler } = this._beforeImportHandler[key];
            const result = handler.doResolve(model, key);
            model = result.model;
            if (result.unresolvedModels) {
                entry.errors = (entry.errors ?? []).concat(this.getVerboseError(result.verboseName as string));
                this.updatePreview();
                break;
            }
        }
        for (const key of Object.keys(this._afterImportHandler)) {
            delete model[key as keyof MainModel];
        }
        return model;
    }

    private parseCsvValue<ToImport>(value: string, config: CsvValueParsingConfig<MainModel, ToImport>): any {
        if (config.importFindHandler) {
            const { importModel, allImportModels } = config;
            return config.importFindHandler.findByName(value, { importModel, allImportModels });
        }
        value = this.pipeParseValue(value, config.header) ?? value;
        return value;
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
        } else if (this._receivedHeaders.length < this.expectedHeaders.length) {
            this.matSnackbar.open(
                this.translate.instant(`The file seems to have some ommitted columns. They will be considered empty.`),
                ``,
                { duration: snackbarDuration }
            );
        } else if (this._receivedHeaders.length > this.expectedHeaders.length) {
            this.matSnackbar.open(
                this.translate.instant(`The file seems to have additional columns. They will be ignored.`),
                ``,
                { duration: snackbarDuration }
            );
        }
        return true;
    }

    private checkReceivedHeaders(): void {
        const leftReceivedHeaders = [...this._receivedHeaders];
        const expectedHeaders = [...this.expectedHeaders];
        while (expectedHeaders.length > 0) {
            const toExpected = expectedHeaders.shift() as string;
            const nextHeader = this._modelHeadersAndVerboseNames[toExpected];
            const nextHeaderTranslated = this.translate.instant(nextHeader);
            let index = leftReceivedHeaders.findIndex(header => header === nextHeaderTranslated);
            if (index > -1) {
                this._mapReceivedExpectedHeaders[toExpected] = nextHeaderTranslated;
                leftReceivedHeaders.splice(index, 1);
                continue;
            }
            index = leftReceivedHeaders.findIndex(header => header === nextHeader);
            if (index > -1) {
                this._mapReceivedExpectedHeaders[toExpected] = nextHeader;
                leftReceivedHeaders.splice(index, 1);
                continue;
            }
            this._mapReceivedExpectedHeaders[toExpected] = toExpected;
            this._lostHeaders.expected[toExpected] = nextHeaderTranslated;
        }
        this._lostHeaders.received = leftReceivedHeaders;
        this.checkImportValidness();
    }

    private checkImportValidness(): void {
        const requiredFulfilled = this._requiredFields.every(
            field => !Object.keys(this._lostHeaders.expected).includes(field as string)
        );
        const validModels = this.importModels.some(importModel => !importModel.errors.length);
        this._isImportValidSubject.next(requiredFulfilled && validModels);
    }

    private async propagateNextNewEntries(): Promise<void> {
        const rawEntries = this._csvLines.map((line, i) => this.createRawImportModel(line, i + 1));
        await this.onBeforeCreatingImportModels(rawEntries);
        for (let entry of rawEntries) {
            const nextEntry = await this.createImportModel(entry);
            this.pushNextNewEntry(nextEntry);
        }
        for (const importHandler of this.getEveryImportHandler()) {
            if (hasBeforeFindAction(importHandler)) {
                await importHandler.onBeforeFind(this.importModels);
            }
        }
        this.importModels.forEach(importModel => this.mapData(importModel));
        for (const importHandler of this.getEveryImportHandler()) {
            importHandler.pipeModels(this.importModels);
        }
        this.checkImportValidness();
    }

    private pushNextNewEntry(nextEntry: ImportModel<MainModel>): void {
        const oldEntries = this._newEntries.value;
        oldEntries[nextEntry.id] = nextEntry;
        this.setNextEntries(oldEntries);
    }

    private getEveryImportHandler(): ImportHandler[] {
        const beforeImportHandlers = Object.values(this._beforeImportHandler).map(({ mainHandler }) => mainHandler);
        const afterImportHandlers = Object.values(this._afterImportHandler).flatMap(
            ({ mainHandler, additionalHandlers }) => [mainHandler, ...additionalHandlers]
        );
        return [...beforeImportHandlers, ...this.getEveryMainImportHandler(), ...afterImportHandlers];
    }

    private getEveryMainImportHandler(): MainImportHandler<MainModel>[] {
        return [this.getSelfImportHelper(), ...this._otherMainImportHelper];
    }

    // Abstract methods
    public abstract downloadCsvExample(): void;
    protected abstract getConfig(): ImportConfig<MainModel>;
}
