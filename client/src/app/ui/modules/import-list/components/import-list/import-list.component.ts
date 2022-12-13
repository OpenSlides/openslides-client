import {
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatTab, MatTabChangeEvent } from '@angular/material/tabs';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { auditTime, distinctUntilChanged, firstValueFrom, map, Observable, of } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { ImportModel } from 'src/app/infrastructure/utils/import/import-model';
import { ImportStep, ImportStepPhase } from 'src/app/infrastructure/utils/import/import-step';
import { CsvMapping, ValueLabelCombination } from 'src/app/infrastructure/utils/import/import-utils';
import { ImportService } from 'src/app/ui/base/import-service';

import { END_POSITION, START_POSITION } from '../../../scrolling-table/directives/scrolling-table-cell-position';
import { ImportListHeaderDefinition } from '../../definitions';
import { ImportListFirstTabDirective } from '../../directives/import-list-first-tab.directive';
import { ImportListLastTabDirective } from '../../directives/import-list-last-tab.directive';
import { ImportListStatusTemplateDirective } from '../../directives/import-list-status-template.directive';

@Component({
    selector: `os-import-list`,
    templateUrl: `./import-list.component.html`,
    styleUrls: [`./import-list.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class ImportListComponent<M extends Identifiable> implements OnInit, OnDestroy {
    public readonly END_POSITION = END_POSITION;
    public readonly START_POSITION = START_POSITION;

    @ContentChildren(ImportListFirstTabDirective, { read: MatTab })
    public importListFirstTabs!: QueryList<MatTab>;

    @ContentChildren(ImportListLastTabDirective, { read: MatTab })
    public importListLastTabs!: QueryList<MatTab>;

    @ContentChild(ImportListStatusTemplateDirective, { read: TemplateRef })
    public importListStateTemplate: TemplateRef<any>;

    @ViewChild(`fileInput`)
    private fileInput!: ElementRef<HTMLInputElement>;

    @Input()
    public columns?: ImportListHeaderDefinition[];

    @Input()
    public headerDefinition?: ImportListHeaderDefinition;

    @Input()
    public rowHeight = 50;

    @Input()
    public modelName = ``;

    @Input()
    public additionalInfo = ``;

    @Input()
    public set importer(importer: ImportService<M>) {
        this._importer = importer;
        this.initTable();
        // importer.errorEvent.subscribe(this.raiseError);
    }

    public get importer(): ImportService<M> {
        return this._importer;
    }

    private _importer!: ImportService<M>;

    /**
     * Defines all necessary and optional fields, that a .csv-file has to contain.
     */
    @Input()
    public possibleFields: string[] = [];

    @Input()
    public showUnknownHeaders = true;

    @Output()
    public selectedTabChanged = new EventEmitter<number>();

    public readonly Phase = ImportStepPhase;

    /**
     * Switch that turns true if a file has been selected in the input
     */
    public hasFile!: Observable<boolean>;
    public get rawFileObservable(): Observable<File | null> {
        return this._importer?.rawFileObservable || of(null);
    }

    public get defaultColumns(): ImportListHeaderDefinition[] {
        return this._defaultColumns;
    }

    /**
     * Currently selected encoding. Is set and changed by the config's available
     * encodings and user mat-select input
     */
    public selectedEncoding = `utf-8`;

    /**
     * indicator on which elements to display
     */
    public shown: 'all' | 'error' | 'noerror' = `all`;

    public get hasLeftReceivedHeaders(): boolean {
        return this.leftReceivedHeaders.length > 0;
    }

    public get leftReceivedHeaders(): string[] {
        return this._importer.leftReceivedHeaders;
    }

    public get leftExpectedHeaders(): { [key: string]: string } {
        return this._importer.leftExpectedHeaders;
    }

    /**
     * @returns the amount of total item successfully parsed
     */
    public get totalCount(): number | null {
        return this._importer && this.hasFile ? this._importer.summary.total : null;
    }

    /**
     * @returns the encodings available and their labels
     */
    public get encodings(): ValueLabelCombination[] {
        return this._importer.encodings;
    }

    /**
     * @returns the available column separators and their labels
     */
    public get columnSeparators(): ValueLabelCombination[] {
        return this._importer.columnSeparators;
    }

    /**
     * @eturns the available text separators and their labels
     */
    public get textSeparators(): ValueLabelCombination[] {
        return this._importer.textSeparators;
    }

    /**
     * @returns the amount of import items that will be imported
     */
    public get newCount(): number {
        return this._importer && this.hasFile ? this._importer.summary.new : 0;
    }

    /**
     * @returns the number of import items that cannot be imported
     */
    public get nonImportableCount(): number {
        if (this._importer && this.hasFile) {
            return this._importer.summary.errors + this._importer.summary.duplicates;
        }
        return 0;
    }

    /**
     * @returns the number of import items that have been successfully imported
     */
    public get doneCount(): number {
        return this._importer && this.hasFile ? this._importer.summary.done : 0;
    }

    public get importPreviewLabel(): string {
        return `${this.modelName || `Models`} will be imported.`;
    }

    public get importDoneLabel(): string {
        return `${this.modelName || `Models`} have been imported.`;
    }

    public get importingStepsObservable(): Observable<ImportStep[]> {
        return this._importer.importingStepsObservable;
    }

    public get requiredFields(): string[] {
        return this._requiredFields;
    }

    public get dataSource(): Observable<ImportModel<M>[]> {
        return this._dataSource;
    }

    public headerValueMap: any = {};

    private _dataSource: Observable<ImportModel<M>[]> = of([]);
    private _requiredFields: string[] = [];
    private _defaultColumns: ImportListHeaderDefinition[] = [];

    public constructor(private host: ElementRef<HTMLElement>, private dialog: MatDialog) {}

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public ngOnInit(): void {
        this._importer.clearPreview();
        this._defaultColumns = this.createColumns();
        this._requiredFields = this.createRequiredFields();
    }

    public ngOnDestroy(): void {
        this._importer.clearFile();
        this._importer.clearPreview();
    }

    /**
     * Triggers a change in the tab group: Clearing the preview selection
     */
    public onTabChange({ index }: MatTabChangeEvent): void {
        this._importer.clearPreview();
        this.selectedTabChanged.emit(index);
    }

    /**
     * Initializes the table
     */
    public initTable(): void {
        const newEntriesObservable = this._importer.getNewEntriesObservable();
        this.hasFile = newEntriesObservable.pipe(
            distinctUntilChanged(),
            auditTime(100),
            map(entries => entries.length > 0)
        );

        this._dataSource = newEntriesObservable;
    }

    public hasSeveralTabs(): boolean {
        return this.importListFirstTabs.length + this.importListLastTabs.length > 0;
    }

    /**
     * triggers the importer's onSelectFile after a file has been chosen
     */
    public onSelectFile(event: any): void {
        this._importer.onSelectFile(event);
    }

    /**
     * Triggers the importer's import
     *
     */
    public async doImport(): Promise<void> {
        this._importer.doImport().then(() => this.setFilter());
    }

    public removeSelectedFile(): void {
        this.fileInput.nativeElement.value = ``;
        this._importer.clearFile();
    }

    /**
     * Updates and manually triggers the filter function.
     * See {@link hidden} for options
     * (changed from default mat-table filter)
     */
    public setFilter(): void {
        if (this.shown === `all`) {
            // this.vScrollDataSource.setFilter();
        } else if (this.shown === `noerror`) {
            // const noErrorFilter = (data: ImportModel<any>) => data.status === `done` || data.status !== `error`;
            // this.vScrollDataSource.setFilter(noErrorFilter);
        } else if (this.shown === `error`) {
            // const hasErrorFilter = (data: ImportModel<any>) =>
            //     data.status === `error` || !!data.errors.length || data.hasDuplicates;
            // this.vScrollDataSource.setFilter(hasErrorFilter);
        }
    }

    /**
     * Get the appropiate css class for a row according to the import state
     *
     * @param row a newEntry object with a current status
     * @returns a css class name
     */
    public getStateClass(row: ImportModel<M>): string {
        switch (row.status) {
            case `done`:
                return `import-done import-decided`;
            case `error`:
                return `import-error`;
            default:
                return ``;
        }
    }

    /**
     * Get the icon for the action of the item
     * @param entry a newEntry object with a current status
     * @eturn the icon for the action of the item
     */
    public getActionIcon(entry: ImportModel<M>): string {
        switch (entry.status) {
            case `error`: // no import possible
                return `block`;
            case `new`:
                return `add`;
            case `done`: // item has been imported
                return `done`;
            default:
                return `block`; // fallback: Error
        }
    }

    public getTooltip(value: string | CsvMapping[]): string {
        if (Array.isArray(value)) {
            return value.map(entry => entry.name).join(`;\n\r`);
        }
        return value;
    }

    public getErrorDescription(entry: ImportModel<M>): string {
        return entry.errors.map(error => _(this.getVerboseError(error))).join(`, `);
    }

    public isUnknown(headerKey: string): boolean {
        return !this._importer.headerValues[headerKey];
    }

    public onChangeUnknownHeaderKey(headerKey: string, value: string): void {
        this.headerValueMap[headerKey] = value;
        this._importer.setNewHeaderValue({ [headerKey]: value });
    }

    /**
     * A function to trigger the csv example download.
     */
    public downloadCsvExample(): void {
        this._importer.downloadCsvExample();
    }

    /**
     * Trigger for the column separator selection.
     *
     * @param event
     */
    public selectColSep(event: MatSelectChange): void {
        this._importer.columnSeparator = event.value;
        this._importer.refreshFile();
    }

    /**
     * Trigger for the column separator selection
     *
     * @param event
     */
    public selectTextSep(event: MatSelectChange): void {
        this._importer.textSeparator = event.value;
        this._importer.refreshFile();
    }

    /**
     * Trigger for the encoding selection
     *
     * @param event
     */
    public selectEncoding(event: MatSelectChange): void {
        this._importer.encoding = event.value;
        this._importer.refreshFile();
    }

    /**
     * Returns a descriptive string for an import error
     *
     * @param error The short string for the error as listed in the {@lilnk errorList}
     * @returns a predefined descriptive error string from the importer
     */
    public getVerboseError(error: string): string {
        return this._importer.verbose(error);
    }

    /**
     * Checks if an error is present in a new entry
     *
     * @param row the NewEntry
     * @param error An error as defined as key of {@link errorList}
     * @returns true if the error is present in the entry described in the row
     */
    public hasError(row: ImportModel<M>, error: string): boolean {
        return this._importer.hasError(row, error);
    }

    public async enterFullscreen(dialogTemplate: TemplateRef<any>): Promise<void> {
        const ref = this.dialog.open(dialogTemplate, { width: `80vw` });
        await firstValueFrom(ref.afterClosed());
    }

    public isArray(data: any): boolean {
        return Array.isArray(data);
    }

    public isObject(data: any): boolean {
        return typeof data === `object`;
    }

    public getLabelByStepPhase(phase: ImportStepPhase): string {
        switch (phase) {
            case ImportStepPhase.FINISHED:
                return _(`have been created`);
            case ImportStepPhase.ERROR:
                return _(`could not be created`);
            default:
                return _(`will be created`);
        }
    }

    public isTrue(value: any) {
        return [`true`, 1, true, `1`].includes(value);
    }

    private createColumns(): ImportListHeaderDefinition[] {
        const getHeaderProp = (prop: string) => {
            return prop.startsWith(`newEntry.`) ? prop.slice(`newEntry.`.length) : prop;
        };
        const definitions = this.columns ?? [this.headerDefinition];
        if (!definitions) {
            throw new Error(`You have to specify the columns to show`);
        }
        if (Array.isArray(definitions) && definitions.length > 0) {
            const computedDefinitions = definitions
                .filter((definition: ImportListHeaderDefinition) => definition.isTableColumn)
                .map(column => ({
                    ...column,
                    property: getHeaderProp(column.property),
                    type: this.getTypeByProperty(getHeaderProp(column.property))
                }));
            return computedDefinitions;
        }
        return [];
    }

    private createRequiredFields(): string[] {
        const definitions: ImportListHeaderDefinition[] = this.columns ?? [this.headerDefinition!];
        if (Array.isArray(definitions) && definitions.length > 0) {
            return definitions
                .filter((definition: ImportListHeaderDefinition) => definition.isRequired as boolean)
                .map(definition => definition.label as string);
        } else {
            return [];
        }
    }

    private getTypeByProperty(property: string): 'boolean' | 'string' {
        if (property.startsWith(`is`) || property.startsWith(`has`)) {
            return `boolean`;
        } else {
            return `string`;
        }
    }
}
