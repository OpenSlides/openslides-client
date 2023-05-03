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
import { TranslateService } from '@ngx-translate/core';
import { delay, firstValueFrom, map, Observable, of } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ValueLabelCombination } from 'src/app/infrastructure/utils/import/import-utils';
import { ViaBackendImportService } from 'src/app/ui/base/import-service';

import { END_POSITION, START_POSITION } from '../../../scrolling-table/directives/scrolling-table-cell-position';
import { ImportListHeaderDefinition } from '../../definitions';
import {
    ImportState,
    ImportViaBackendIndexedPreview,
    ImportViaBackendPreviewHeader,
    ImportViaBackendPreviewIndexedRow,
    ImportViaBackendPreviewSummary
} from '../../definitions/import-via-backend-preview';
import { ImportListFirstTabDirective } from '../../directives/import-list-first-tab.directive';
import { ImportListLastTabDirective } from '../../directives/import-list-last-tab.directive';
import { ImportListStatusTemplateDirective } from '../../directives/import-list-status-template.directive';

export enum ImportViaBackendPhase {
    LOADING_PREVIEW,
    AWAITING_CONFIRM,
    IMPORTING,
    FINISHED,
    ERROR,
    TRY_AGAIN
}

@Component({
    selector: `os-via-backend-import-list`,
    templateUrl: `./via-backend-import-list.component.html`,
    styleUrls: [`./via-backend-import-list.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class ViaBackendImportListComponent<M extends Identifiable> implements OnInit, OnDestroy {
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
    public rowHeight = 50;

    @Input()
    public modelName = ``;

    @Input()
    public additionalInfo = ``;

    @Input()
    public set importer(importer: ViaBackendImportService<M>) {
        this._importer = importer;
    }

    public get importer(): ViaBackendImportService<M> {
        return this._importer;
    }

    private _importer!: ViaBackendImportService<M>;

    /**
     * Defines all necessary and optional fields, that a .csv-file has to contain.
     */
    @Input()
    public possibleFields: string[] = [];

    @Output()
    public selectedTabChanged = new EventEmitter<number>();

    public readonly Phase = ImportViaBackendPhase;

    public get rawFileObservable(): Observable<File | null> {
        return this._importer?.rawFileObservable || of(null);
    }

    public get defaultColumns(): ImportListHeaderDefinition[] {
        return this._defaultColumns;
    }

    @Input()
    public set defaultColumns(cols: ImportListHeaderDefinition[]) {
        this._defaultColumns = cols;
    }

    public get previewColumns(): ImportViaBackendPreviewHeader[] {
        return this._previewColumns;
    }

    public get summary(): ImportViaBackendPreviewSummary[] {
        return this._summary;
    }

    public get rows(): ImportViaBackendPreviewIndexedRow[] {
        return this._rows;
    }
    private _summary: ImportViaBackendPreviewSummary[];
    private _rows: ImportViaBackendPreviewIndexedRow[];
    private _previewColumns: ImportViaBackendPreviewHeader[];

    public get awaitingConfirm(): boolean {
        return this._state === ImportViaBackendPhase.AWAITING_CONFIRM || this.tryAgain;
    }

    public get finishedSuccessfully(): boolean {
        return this._state === ImportViaBackendPhase.FINISHED;
    }

    public get tryAgain(): boolean {
        return this._state === ImportViaBackendPhase.TRY_AGAIN;
    }

    public get isImporting(): boolean {
        return this._state === ImportViaBackendPhase.IMPORTING;
    }

    public get hasErrors(): boolean {
        return this._state === ImportViaBackendPhase.ERROR;
    }

    private _state: ImportViaBackendPhase = ImportViaBackendPhase.LOADING_PREVIEW;

    /**
     * Currently selected encoding. Is set and changed by the config's available
     * encodings and user mat-select input
     */
    public selectedEncoding = `utf-8`;

    /**
     * indicator on which elements to display
     */
    public shown: 'all' | 'error' | 'noerror' = `all`;

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

    public get hasRowErrors(): boolean {
        return this._hasErrors;
    }

    private _hasErrors: boolean = false;

    public get requiredFields(): string[] {
        return this._requiredFields;
    }

    public get dataSource(): Observable<ImportViaBackendPreviewIndexedRow[]> {
        return this._dataSource;
    }

    private _dataSource: Observable<ImportViaBackendPreviewIndexedRow[]> = of([]);
    private _requiredFields: string[] = [];
    private _defaultColumns: ImportListHeaderDefinition[] = [];

    public constructor(private dialog: MatDialog, private translate: TranslateService) {}

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public ngOnInit(): void {
        this._importer.clearPreview();
        this._requiredFields = this.createRequiredFields();
        this._importer.currentImportPhaseObservable.subscribe(phase => {
            this._state = phase;
        });
        this._importer.previewsObservable.subscribe(previews => {
            this.fillPreviewData(previews);
        });
        this._dataSource = this.importer.previewsObservable.pipe(
            map(previews => this.calculateRows(previews)),
            delay(50)
        );
    }

    public ngOnDestroy(): void {
        this._importer.clearFile();
        this._importer.clearPreview();
    }

    /**
     * Triggers a change in the tab group: Clearing the preview selection
     */
    public onTabChange({ index }: MatTabChangeEvent): void {
        this.removeSelectedFile();
        this._importer.clearAll();
        this.selectedTabChanged.emit(index);
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
        this._importer.doImport();
    }

    public removeSelectedFile(): void {
        if (this.fileInput) {
            this.fileInput.nativeElement.value = ``;
        }
        this._importer.clearFile();
    }

    public getHeader(propertyName: string): ImportViaBackendPreviewHeader {
        return this._previewColumns.find(header => header.property === propertyName);
    }

    /**
     * Get the icon for the action of the item
     * @param entry a newEntry object with a current status
     * @eturn the icon for the action of the item
     */
    public getActionIcon(entry: ImportViaBackendPreviewIndexedRow): string {
        switch (entry.status) {
            case ImportState.Error: // no import possible
                return `block`;
            case ImportState.Warning:
                return `warning`;
            case ImportState.New:
                return `add`;
            case ImportState.Done: // item has been imported
                return `done`;
            case ImportState.Generated:
                return `autorenew`;
            default:
                return `block`; // fallback: Error
        }
    }

    public getRowTooltip(row: ImportViaBackendPreviewIndexedRow): string {
        switch (row.status) {
            case ImportState.Error: // no import possible
                return (
                    this.getErrorDescription(row) ??
                    _(`There is an unspecified error in this line, which prevents the import.`)
                );
            case ImportState.Warning:
                return this.getErrorDescription(row) ?? _(`This row will not be imported, due to an unknown reason.`);
            case ImportState.New:
                return this.translate.instant(this.modelName) + ` ` + this.translate.instant(`will be imported`);
            case ImportState.Done: // item has been imported
                return this.translate.instant(this.modelName) + ` ` + this.translate.instant(`has been imported`);
            default:
                return undefined;
        }
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

    public getColumnWidth(propertyName: string): number {
        return this.defaultColumns.find(col => col.property === propertyName)?.width ?? 50;
    }

    public getColumnLabel(propertyName: string): string {
        return this.defaultColumns.find(col => col.property === propertyName)?.label ?? propertyName;
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
    public hasError(row: ImportViaBackendPreviewIndexedRow, error: string): boolean {
        return this._importer.hasError(row, error);
    }

    public async enterFullscreen(dialogTemplate: TemplateRef<any>): Promise<void> {
        const ref = this.dialog.open(dialogTemplate, { width: `80vw` });
        await firstValueFrom(ref.afterClosed());
    }

    public async openDialog(dialogTemplate: TemplateRef<any>): Promise<void> {
        const ref = this.dialog.open(dialogTemplate, infoDialogSettings);
        await firstValueFrom(ref.afterClosed());
    }

    public getSummaryPointTitle(title: string): string {
        return this._importer.getVerboseSummaryPointTitle(title);
    }

    private getErrorDescription(entry: ImportViaBackendPreviewIndexedRow): string {
        return entry.message?.map(error => this.translate.instant(this.getVerboseError(error))).join(`,\n `);
    }

    private fillPreviewData(previews: ImportViaBackendIndexedPreview[]) {
        if (!previews || !previews.length) {
            this._previewColumns = undefined;
            this._summary = undefined;
            this._rows = undefined;
            this._hasErrors = false;
        } else {
            this._previewColumns = previews[0].headers;
            this._summary = previews.flatMap(preview => preview.statistics).filter(point => point.value);
            this._rows = this.calculateRows(previews);
            this._hasErrors = this.importer.previewHasRowErrors;
        }
    }

    private calculateRows(previews: ImportViaBackendIndexedPreview[]): ImportViaBackendPreviewIndexedRow[] {
        return previews?.flatMap(preview => preview.rows);
    }

    private createRequiredFields(): string[] {
        const definitions = this.defaultColumns;
        if (Array.isArray(definitions) && definitions.length > 0) {
            return definitions
                .filter(definition => definition.isRequired as boolean)
                .map(definition => definition.property as string);
        } else {
            return [];
        }
    }
}
