import { EventEmitter, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateService } from '@ngx-translate/core';
import { Papa, ParseConfig } from 'ngx-papaparse';
import { BehaviorSubject, Observable } from 'rxjs';

import { Id } from '../definitions/key-types';
import { StaticBeforeImportHandler } from '../../shared/utils/import/static-before-import-handler';
import { StaticBeforeImportConfig } from '../../shared/utils/import/static-before-import-config';
import { Identifiable } from '../../shared/models/base/identifiable';
import { ImportServiceCollector } from './import-service-collector';
import { MergeMap } from '../../shared/utils/merge-map';
import { BaseAfterImportHandler, AfterImportHandler } from '../../shared/utils/import/base-after-import-handler';
import { BeforeImportHandler, BaseBeforeImportHandler } from 'app/shared/utils/import/base-before-import-handler';
import {
    StaticAfterImportConfig,
    StaticAfterImportHandler
} from '../../shared/utils/import/static-after-import-handler';

/**
 * Interface for value- Label combinations.
 */
export interface ValueLabelCombination {
    value: string;
    label: string;
}

interface FileReaderProgressEvent extends ProgressEvent {
    readonly target: FileReader | null;
}

/**
 * Interface matching a newly created entry with their duplicates and an import status
 */
export interface NewEntry<V> {
    newEntry: V;
    status: CsvImportStatus;
    errors: string[];
    hasDuplicates?: boolean;
    importTrackId?: number;
}

/**
 * interface for a preview summary
 */
export interface ImportCSVPreview {
    total: number;
    duplicates: number;
    errors: number;
    new: number;
    done: number;
}

/**
 * Interface for correlating between strings representing BaseModels and existing
 * BaseModels.
 */
export type CsvMapping<T = any> = T & {
    name: string;
    id?: Id;
    multiId?: Id[];
};

/**
 * The permitted states of a new entry. Only a 'new' entry should be imported
 * and then be set to 'done'.
 */
export type CsvImportStatus = 'new' | 'error' | 'done';

export interface CsvJsonMapping {
    [key: string]: string;
}

export interface ImportConfig<ToCreate = any, K = any> {
    modelHeadersAndVerboseNames: K;
    verboseNameFn: (plural?: boolean) => string;
    hasDuplicatesFn: (entry: Partial<ToCreate>) => boolean;
    createFn: (entries: ToCreate[]) => Promise<Identifiable[]>;
    updateFn?: (entries: ToCreate[]) => Promise<void>;
    requiredFields?: (keyof ToCreate)[];
}

export enum ImportStepPhase {
    ENQUEUED,
    PENDING,
    FINISHED,
    ERROR
}

export interface ImportStep {
    phase: ImportStepPhase;
    getModelsToCreate(): CsvMapping[];
    getModelsImported(): CsvMapping[];
    getVerboseName(plural?: boolean): string;
}

export interface ImportFind<ToImport> {
    findByName: (name: string, line: any, index: number) => CsvMapping<ToImport> | CsvMapping<ToImport>[];
}

export interface ImportResolveHandler<ToCreate, ReturnType = void> {
    doImport: (originalEntries: ToCreate[]) => ReturnType | Promise<ReturnType>;
}

export interface ImportCleanup {
    doCleanup: () => void;
}

/**
 * Abstract service for imports
 */
@Injectable({
    providedIn: 'root'
})
export abstract class BaseImportService<ToCreate extends Identifiable> {
    public chunkSize = 100;

    /**
     * List of possible errors and their verbose explanation
     */
    public errorList: { [errorKey: string]: string } = {};

    /**
     * The headers expected in the CSV matching import properties (in order)
     */
    public expectedHeader: string[];

    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public requiredHeaderLength = 2;

    /**
     * The used column separator. If left on an empty string (default),
     * the papaparse parser will automatically decide on separators.
     */
    public columnSeparator = '';

    /**
     * The used text separator.
     */
    public textSeparator = '"';

    /**
     * The encoding used by the FileReader object.
     */
    public encoding = 'utf-8';

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
        { value: 'utf-8', label: 'UTF 8 - Unicode' },
        { value: 'iso-8859-1', label: 'ISO 8859-1 - West European' },
        { value: 'iso-8859-15', label: 'ISO 8859-15 - West European (with €)' }
    ];

    /**
     * List of possible column separators to pass on to papaParse
     */
    public columnSeparators: ValueLabelCombination[] = [
        { label: 'Comma', value: ',' },
        { label: 'Semicolon', value: ';' },
        { label: 'Automatic', value: '' }
    ];

    /**
     * List of possible text separators to pass on to papaParse. Note that
     * it cannot automatically detect textseparators (value must not be an empty string)
     */
    public textSeparators: ValueLabelCombination[] = [
        { label: 'Double quotes (")', value: '"' },
        { label: "Single quotes (')", value: "'" },
        { label: 'Gravis (`)', value: '`' }
    ];

    /**
     * BehaviorSubject for displaying a preview for the currently selected entries
     */
    public newEntries = new BehaviorSubject<NewEntry<ToCreate>[]>([]);

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
        return this._preview;
    }

    public get importStepsObservable(): Observable<ImportStep[]> {
        return this._importingStepsSubject.asObservable();
    }

    public get leftReceivedHeaders(): string[] {
        return this._lostHeaders.received;
    }

    public get leftExpectedHeaders(): { [key: string]: string } {
        return this._lostHeaders.expected;
    }

    public get headerValues(): { [header: string]: string } {
        return this._headerValueMap;
    }

    /**
     * storing the summary preview for the import, to avoid recalculating it
     * at each display change.
     */
    private _preview: ImportCSVPreview;

    private _beforeImportHelper: { [key: string]: BeforeImportHandler } = {};
    private _afterImportHelper: { [key: string]: AfterImportHandler } = {};

    private _modelHeadersAndVerboseNames: { [key: string]: string };

    private _verboseNameFn: (plural?: boolean) => string;
    private _hasDuplicatesFn: (entry: Partial<ToCreate>) => boolean;

    private _createFn: (entries: ToCreate[]) => Promise<Identifiable[]>;
    private _updateFn: (entries: ToCreate[]) => Promise<void>;

    protected readonly translate: TranslateService = this.serviceCollector.translate;
    protected readonly matSnackbar: MatSnackBar = this.serviceCollector.matSnackBar;

    /**
     * Returns the current entries. For internal use in extending classes, as it
     * might not be filled with data at all times (see {@link newEntries} for a BehaviorSubject)
     */
    protected get entries(): NewEntry<ToCreate>[] {
        return this._entries;
    }

    /**
     * The last parsed file object (may be reparsed with new encoding, thus kept in memory)
     */
    private _rawFile: File;

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
    private _entries: NewEntry<ToCreate>[] = [];
    private _csvLines: { [header: string]: string }[] = [];
    private _headers: string[] = [];
    private _headerValueMap: { [header: string]: string } = {};
    private _requiredFields: (keyof ToCreate)[] = [];
    private _lostHeaders: { expected: { [key: string]: string }; received: string[] } = {
        expected: {},
        received: []
    };

    private _selfImportHelper: ImportStep = {
        phase: ImportStepPhase.ENQUEUED,
        getModelsImported: () => [],
        getModelsToCreate: () => this.entries.filter(entry => !entry.hasDuplicates),
        getVerboseName: (plural?: boolean) => this._verboseNameFn(plural)
    };

    private readonly _papa: Papa = this.serviceCollector.papa;

    /**
     * Constructor. Creates a fileReader to subscribe to it for incoming parsed
     * strings
     *
     * @param translate Translation service
     * @param papa External csv parser (ngx-papaparser)
     * @param matSnackBar snackBar to display import errors
     */
    public constructor(private serviceCollector: ImportServiceCollector) {
        this._reader.onload = (event: FileReaderProgressEvent) => {
            this.parseInput(event.target.result as string);
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
            skipEmptyLines: 'greedy',
            quoteChar: this.textSeparator
        };
        if (this.columnSeparator) {
            papaConfig.delimiter = this.columnSeparator;
        }
        const result = this._papa.parse(file, papaConfig);
        this._csvLines = result.data;
        this._headers = Object.keys(this._csvLines[0]);
        const valid = this.checkHeaderLength();
        this.checkHeaderValue();
        if (!valid) {
            return;
        }
        this.setNextEntries(this._csvLines.map((x, index) => this.mapData(x, index + 1)).filter(x => !!x));
        this.updateSummary();
    }

    /**
     * parses pre-prepared entries (e.g. from a textarea) instead of a csv structure
     *
     * @param entries: an array of prepared newEntry objects
     */
    public setParsedEntries(entries: NewEntry<ToCreate>[]): void {
        this.clearPreview();
        if (!entries) {
            return;
        }
        this.setNextEntries(entries);
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
        this._entries.forEach(entry => {
            summary.total += 1;
            if (entry.status === 'done') {
                summary.done += 1;
                return;
            } else if (entry.status === 'error' && !entry.hasDuplicates) {
                // errors that are not due to duplicates
                summary.errors += 1;
                return;
            } else if (entry.hasDuplicates) {
                summary.duplicates += 1;
                return;
            } else if (entry.status === 'new') {
                summary.new += 1;
            }
        });
        this._preview = summary;
    }

    public updateSummary(): void {
        this._importingStepsSubject.next([
            ...Object.values(this._beforeImportHelper),
            this.getSelfImportHelper(),
            ...Object.values(this._afterImportHelper)
        ]);
    }

    /**
     * a subscribable representation of the new items to be imported
     *
     * @returns an observable BehaviorSubject
     */
    public getNewEntries(): Observable<NewEntry<ToCreate>[]> {
        return this.newEntries.asObservable();
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
        Object.values(this._beforeImportHelper).forEach(helper => helper.doCleanup());
        Object.values(this._afterImportHelper).forEach(helper => helper.doCleanup());
        this.setNextEntries([]);
        this._selfImportHelper.getModelsImported = () => [];
        this._selfImportHelper.phase = ImportStepPhase.ENQUEUED;
        this._lostHeaders = { expected: {}, received: [] };
        this._preview = null;
        this._currentImportPhaseSubject.next(ImportStepPhase.ENQUEUED);
        this._isImportValidSubject.next(false);
    }

    /**
     * set a list of short names for error, indicating which column failed
     */
    public setError(entry: NewEntry<Partial<ToCreate>>, error: string): void {
        if (this.errorList[error]) {
            if (!entry.errors) {
                entry.errors = [error];
            } else if (!entry.errors.includes(error)) {
                entry.errors.push(error);
                entry.status = 'error';
            }
        }
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
    public hasError(entry: NewEntry<ToCreate>, error: string): boolean {
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

        const newEntries = this.entries.filter(entry => entry.status === 'new');
        const { indexMap, modelsToCreate } = this.getModelsToCreate(newEntries);

        this._selfImportHelper.phase = ImportStepPhase.PENDING;
        const identifiables = await this.createEntries(
            modelsToCreate.filter(model => !model.id),
            modelsToCreate.filter(model => !!model.id)
        );

        do {
            const nextId = identifiables.shift().id;
            indexMap.set(indexMap.getNextFreeSlot(), nextId);
        } while (identifiables.length > 0);

        for (let i = 0; i < newEntries.length; ++i) {
            const entry = newEntries[i];
            const toCreate = modelsToCreate[i];
            entry.newEntry.id = indexMap.get(i);
            toCreate.id = indexMap.get(i);
        }
        this._selfImportHelper.getModelsImported = () => newEntries.filter(entry => !!entry.newEntry.id);
        this._selfImportHelper.phase = ImportStepPhase.FINISHED;

        await this.doAfterImport(modelsToCreate);
        this.doAfterImportCleanup(newEntries);

        this._currentImportPhaseSubject.next(ImportStepPhase.FINISHED);
        this.updatePreview();
    }

    private getModelsToCreate(newEntries: NewEntry<ToCreate>[]): {
        indexMap: MergeMap<Id>;
        modelsToCreate: ToCreate[];
    } {
        const indexMap = new MergeMap<Id>();
        const modelsToCreate: ToCreate[] = [];
        for (let i = 0; i < newEntries.length; ++i) {
            const entry = newEntries[i];
            const model = this.resolveEntry(entry);
            modelsToCreate.push(model);
            if (model.id) {
                indexMap.set(i, model.id);
            }
        }
        return { indexMap, modelsToCreate };
    }

    private async doBeforeImport(): Promise<void> {
        for (const helper of Object.values(this._beforeImportHelper)) {
            if (helper.getModelsToCreate().length > 0) {
                await helper.doImport(this.entries.map(entry => entry.newEntry));
            }
        }
    }

    private async doAfterImport(modelsToCreate: ToCreate[]): Promise<void> {
        for (const handler of Object.values(this._afterImportHelper)) {
            await handler.doImport(modelsToCreate);
        }
    }

    private doAfterImportCleanup(newEntries: NewEntry<ToCreate>[]): void {
        for (const entry of newEntries) {
            if (!entry.newEntry.id) {
                entry.status = 'error';
            } else {
                entry.status = 'done';
            }
        }
    }

    private async createEntries(entriesToCreate: ToCreate[], entriesToUpdate: ToCreate[]): Promise<Identifiable[]> {
        const identifiables: Identifiable[] = [];
        for (let i = 0; i < Math.ceil(entriesToCreate.length / this.chunkSize); ++i) {
            identifiables.push(
                ...(await this.sendRequest(
                    entriesToCreate.slice(i * this.chunkSize, (i + 1) * this.chunkSize),
                    this._createFn
                ))
            );
        }
        for (let i = 0; i < Math.ceil(entriesToUpdate.length / this.chunkSize); ++i) {
            await this.sendRequest<any>(
                entriesToUpdate.slice(i * this.chunkSize, (i + 1) * this.chunkSize),
                this._updateFn as any
            );
        }
        return identifiables;
    }

    private async sendRequest<R>(models: ToCreate[], fn: (entries: ToCreate[]) => Promise<R[]>): Promise<R[]> {
        const request = async (data: ToCreate[]) => {
            const returnValue = await fn(data);
            const previousValue = this._selfImportHelper.getModelsImported();
            this._selfImportHelper.getModelsImported = () => previousValue.concat(data);
            return returnValue;
        };
        const sendSingleRequest = async (model: ToCreate) => {
            let returnValue: R[] = [];
            try {
                returnValue = await request([model]);
            } catch (e) {
                returnValue = [{}] as R[];
            }
            return returnValue;
        };
        const result: R[] = [];
        try {
            result.push(...(await request(models)));
        } catch (e) {
            for (const model of models) {
                result.push(...(await sendSingleRequest(model)));
            }
        }
        return result;
    }

    public setNewHeaderValue(map: { [headerKey: string]: string }): void {
        for (const headerKey of Object.keys(map)) {
            this._headerValueMap[headerKey] = map[headerKey];
            delete this._lostHeaders.expected[headerKey];
            this.leftReceivedHeaders.splice(
                this.leftReceivedHeaders.findIndex(header => header === map[headerKey]),
                1
            );
        }
        this.checkImportValidness();
        this.setNextEntries(this._csvLines.map((x, index) => this.mapData(x, index)).filter(x => !!x));
    }

    private setNextEntries(nextEntries: NewEntry<ToCreate>[]): void {
        this._entries = nextEntries;
        this.newEntries.next(this.entries);
        this.updatePreview();
    }

    /**
     * A helper function to specify import-helpers for `ToCreate`.
     * Should be overriden to specify the import-helpers.
     *
     * @returns A map containing import-helpers for specific attributes of `ToCreate`.
     */
    protected getBeforeImportHelpers(): { [key: string]: BeforeImportHandler<ToCreate, any> } {
        return {};
    }

    protected pipeParseValue(_value: string, _header: keyof ToCreate): any {}

    protected registerBeforeImportHelper<ToImport>(
        header: string,
        handler: StaticBeforeImportConfig<ToCreate, ToImport> | BaseBeforeImportHandler
    ): void {
        if (handler instanceof BaseBeforeImportHandler) {
            this._beforeImportHelper[header] = handler as any;
        } else {
            this._beforeImportHelper[header] = new StaticBeforeImportHandler(handler, key =>
                this.translate.instant(key)
            );
        }
    }

    protected registerAfterImportHandler<ToImport>(
        header: string,
        handler: StaticAfterImportConfig<ToCreate, ToImport> | BaseAfterImportHandler
    ): void {
        if (handler instanceof BaseAfterImportHandler) {
            this._afterImportHelper[header] = handler;
        } else {
            this._afterImportHelper[header] = new StaticAfterImportHandler<ToCreate, ToImport>(
                handler,
                header as keyof ToCreate
            );
        }
    }

    /**
     * Parses a string representing an entry, extracting secondary data, appending
     * the array of secondary imports as needed
     *
     * @param line
     * @returns a new entry representing an User
     */
    private mapData(line: CsvJsonMapping, importTrackId: number): NewEntry<ToCreate> {
        const newEntry: ToCreate = {} as ToCreate;
        let hasError = false;
        const csvEntry = Object.keys(this._headerValueMap).mapToObject(expectedHeader => {
            const originalHeader = this._headerValueMap[expectedHeader];
            return { [expectedHeader]: line[originalHeader] };
        });
        for (const expectedHeader of Object.keys(this._headerValueMap)) {
            const helper = this._beforeImportHelper[expectedHeader] || this._afterImportHelper[expectedHeader];
            try {
                const value = this.parseValue(
                    csvEntry[expectedHeader],
                    { header: expectedHeader as keyof ToCreate, line: csvEntry, index: importTrackId },
                    helper
                );
                newEntry[expectedHeader] = value;
            } catch (e) {
                console.log(`Error while parsing ${expectedHeader}`, e);
                hasError = true;
                continue;
            }
        }
        const hasDuplicates = this._hasDuplicatesFn(newEntry);
        const entry: NewEntry<ToCreate> = {
            newEntry,
            hasDuplicates,
            importTrackId,
            status: hasDuplicates ? 'error' : 'new',
            errors: hasDuplicates ? ['Duplicates'] : []
        };
        if (hasError) {
            this.setError(entry, 'ParsingErrors');
        }
        return entry;
    }

    private init(): void {
        const config = this.getConfig();
        this.expectedHeader = Object.keys(config.modelHeadersAndVerboseNames);
        this._modelHeadersAndVerboseNames = config.modelHeadersAndVerboseNames;
        this._hasDuplicatesFn = config.hasDuplicatesFn;
        this._verboseNameFn = config.verboseNameFn;
        this._createFn = config.createFn;
        this._updateFn = config.updateFn;
        this._requiredFields = config.requiredFields || [];
        this.initializeImportHelpers();
    }

    private getSelfImportHelper(): ImportStep {
        return this._selfImportHelper;
    }

    private initializeImportHelpers(): void {
        this._beforeImportHelper = { ...this._beforeImportHelper, ...this.getBeforeImportHelpers() };
        this.updateSummary();
    }

    private resolveEntry(entry: NewEntry<ToCreate>): ToCreate {
        let model = { ...entry.newEntry } as ToCreate;
        for (const key of Object.keys(this._beforeImportHelper)) {
            const helper = this._beforeImportHelper[key];
            const result = helper.doResolve(model, key);
            model = result.model;
            if (result.unresolvedModels) {
                this.setError(entry, result.verboseName);
                this.updatePreview();
                break;
            }
        }
        return model;
    }

    private parseValue<ToImport>(
        value: string,
        { header, line, index }: { line: any; index: number; header: keyof ToCreate },
        helper?: ImportFind<ToImport>
    ): any {
        if (helper) {
            return helper.findByName(value, line, index);
        }
        value = this.pipeParseValue(value, header) || value;
        return value;
    }

    /**
     * reads the _rawFile
     */
    private readFile(): void {
        this._reader.readAsText(this._rawFile, this.encoding);
    }

    /**
     * Checks the first line of the csv (the header) for consistency (length)
     *
     * @returns true if the line has at least the minimum amount of columns
     */
    private checkHeaderLength(): boolean {
        const snackbarDuration = 3000;
        if (this._headers.length < this.requiredHeaderLength) {
            this.matSnackbar.open(this.translate.instant('The file has too few columns to be parsed properly.'), '', {
                duration: snackbarDuration
            });

            this.clearPreview();
            return false;
        } else if (this._headers.length < this.expectedHeader.length) {
            this.matSnackbar.open(
                this.translate.instant('The file seems to have some ommitted columns. They will be considered empty.'),
                '',
                { duration: snackbarDuration }
            );
        } else if (this._headers.length > this.expectedHeader.length) {
            this.matSnackbar.open(
                this.translate.instant('The file seems to have additional columns. They will be ignored.'),
                '',
                { duration: snackbarDuration }
            );
        }
        return true;
    }

    private checkHeaderValue(): void {
        const leftReceivedHeaders = [...this._headers];
        const expectedHeaders = [...this.expectedHeader];
        while (expectedHeaders.length > 0) {
            const toExpected = expectedHeaders.shift();
            const nextHeader = this._modelHeadersAndVerboseNames[toExpected];
            const nextHeaderTranslated = this.translate.instant(nextHeader);
            let index = leftReceivedHeaders.findIndex(header => header === nextHeaderTranslated);
            if (index > -1) {
                this._headerValueMap[toExpected] = nextHeaderTranslated;
                leftReceivedHeaders.splice(index, 1);
                continue;
            }
            index = leftReceivedHeaders.findIndex(header => header === nextHeader);
            if (index > -1) {
                this._headerValueMap[toExpected] = nextHeader;
                leftReceivedHeaders.splice(index, 1);
                continue;
            }
            this._lostHeaders.expected[toExpected] = nextHeaderTranslated;
        }
        this._lostHeaders.received = leftReceivedHeaders;
        this.checkImportValidness();
    }

    private checkImportValidness(): void {
        this._isImportValidSubject.next(
            this._requiredFields.every(field => !Object.keys(this._lostHeaders.expected).includes(field as string))
        );
    }

    // Abstract methods
    public abstract downloadCsvExample(): void;
    protected abstract getConfig(): ImportConfig<ToCreate>;
}
