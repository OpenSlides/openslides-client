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
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ValueLabelCombination } from 'src/app/infrastructure/utils/import/import-utils';
import { BackendImportService } from 'src/app/ui/base/import-service';

import { ScrollingTableCellDefConfig } from '../../../scrolling-table/directives/scrolling-table-cell-config';
import { END_POSITION, START_POSITION } from '../../../scrolling-table/directives/scrolling-table-cell-position';
import { ImportListHeaderDefinition } from '../../definitions';
import {
    BackendImportEntryObject,
    BackendImportHeader,
    BackendImportIdentifiedRow,
    BackendImportPreview,
    BackendImportState,
    BackendImportSummary
} from '../../definitions/backend-import-preview';
import { ImportListFirstTabDirective } from '../../directives/import-list-first-tab.directive';
import { ImportListLastTabDirective } from '../../directives/import-list-last-tab.directive';
import { ImportListStatusTemplateDirective } from '../../directives/import-list-status-template.directive';

export enum BackendImportPhase {
    LOADING_PREVIEW,
    AWAITING_CONFIRM,
    IMPORTING,
    FINISHED,
    ERROR,
    FINISHED_WITH_WARNING
}

@Component({
    selector: `os-backend-import-list`,
    templateUrl: `./backend-import-list.component.html`,
    styleUrls: [`./backend-import-list.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class BackendImportListComponent implements OnInit, OnDestroy {
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
    public set importer(importer: BackendImportService) {
        this._importer = importer;
    }

    public get importer(): BackendImportService {
        return this._importer;
    }

    private _importer!: BackendImportService;

    /**
     * Defines all necessary and optional fields, that a .csv-file can contain.
     */
    @Input()
    public possibleFields: string[] = [];

    @Output()
    public selectedTabChanged = new EventEmitter<number>();

    public readonly Phase = BackendImportPhase;

    /**
     * Observable that allows one to monitor the currenty selected file.
     */
    public get rawFileObservable(): Observable<File | null> {
        return this._importer?.rawFileObservable || of(null);
    }

    /**
     * Client-side definition of required/accepted columns.
     * Ensures that the client can display information about how the import works.
     */
    @Input()
    public set defaultColumns(cols: ImportListHeaderDefinition[]) {
        this._defaultColumns = cols;
        this.setHeaders({ default: cols });
    }

    public get defaultColumns(): ImportListHeaderDefinition[] {
        return this._defaultColumns;
    }

    /**
     * The actual headers of the preview, as they were delivered by the backend.
     */
    public get previewColumns(): BackendImportHeader[] {
        return this._previewColumns;
    }

    /**
     * The summary of the preview, as it was delivered by the backend.
     */
    public get summary(): BackendImportSummary[] {
        return this._summary;
    }

    /**
     * The rows of the preview, which were delivered by the backend.
     * Affixed with fake ids for the purpose of displaying them correctly.
     */
    public get rows(): BackendImportIdentifiedRow[] {
        return this._rows;
    }

    /**
     * True if, after the first json-upload, the view is waiting for the user to confirm the import.
     */
    public get awaitingConfirm(): boolean {
        return this._state === BackendImportPhase.AWAITING_CONFIRM;
    }

    /**
     * True if the import has successfully finished.
     */
    public get finishedSuccessfully(): boolean {
        return this._state === BackendImportPhase.FINISHED;
    }

    /**
     * True if, after an attempted import failed, the view is waiting for the user to confirm the import on the new preview.
     */
    public get finishedWithWarning(): boolean {
        return this._state === BackendImportPhase.FINISHED_WITH_WARNING;
    }

    /**
     * True while an import is in progress.
     */
    public get isImporting(): boolean {
        return this._state === BackendImportPhase.IMPORTING;
    }

    /**
     * True if the preview can not be imported.
     */
    public get hasErrors(): boolean {
        return this._state === BackendImportPhase.ERROR;
    }

    /**
     * Currently selected encoding. Is set and changed by the config's available
     * encodings and user mat-select input
     */
    public selectedEncoding = `utf-8`;

    public isInFullscreen = false;

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
     * If false there is something wrong with the data.
     */
    public get hasRowErrors(): boolean {
        return this._importer.previewHasRowErrors;
    }

    /**
     * Client side information on the required fields of this import.
     * Generated from the information in the defaultColumns.
     */
    public get requiredFields(): string[] {
        return this._requiredFields;
    }

    /**
     * The Observable from which the views table will be calculated
     */
    public get dataSource(): Observable<BackendImportIdentifiedRow[]> {
        return this._dataSource;
    }

    private _state: BackendImportPhase = BackendImportPhase.LOADING_PREVIEW;

    private _summary: BackendImportSummary[];
    private _rows: BackendImportIdentifiedRow[];
    private _previewColumns: BackendImportHeader[];

    private _dataSource: Observable<BackendImportIdentifiedRow[]> = of([]);
    private _requiredFields: string[] = [];
    private _defaultColumns: ImportListHeaderDefinition[] = [];

    private _headers: {
        [property: string]: { default?: ImportListHeaderDefinition; preview?: BackendImportHeader };
    } = {};

    public constructor(private dialog: MatDialog, private translate: TranslateService) {}

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public ngOnInit(): void {
        this._importer.clearAll();
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

    /**
     * Resets the importer when leaving the view
     */
    public ngOnDestroy(): void {
        this._importer.clearFile();
    }

    /**
     * Triggers a change in the tab group: Clearing the preview selection
     */
    public onTabChange({ index }: MatTabChangeEvent): void {
        this.removeSelectedFile();
        this._importer.clearAll();
        this.selectedTabChanged.emit(index);
    }

    /**
     * True if there are custom tabs.
     */
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
     */
    public async doImport(): Promise<void> {
        this._importer.doImport();
    }

    /**
     * Removes the selected file and also empties the preview.
     */
    public removeSelectedFile(clearImporter = true): void {
        if (this.fileInput) {
            this.fileInput.nativeElement.value = ``;
        }
        if (clearImporter) {
            this._importer.clearFile();
        }
    }

    /**
     * Gets the relevant backend header information for a property.
     */
    public getHeader(propertyName: string): BackendImportHeader {
        return this._headers[propertyName]?.preview;
    }

    /**
     * Gets the style of the column for the given property.
     */
    public getColumnConfig(propertyName: string): ScrollingTableCellDefConfig {
        const defaultHeader = this._headers[propertyName]?.default;
        const colWidth = defaultHeader?.width ?? 50;
        const def: ScrollingTableCellDefConfig = { minWidth: Math.max(150, colWidth) };
        if (!defaultHeader?.flexible) {
            def.width = colWidth;
        }
        return def;
    }

    /**
     * Gets the label of the column for the given property.
     */
    public getColumnLabel(propertyName: string): string {
        return this._headers[propertyName]?.default?.label ?? propertyName;
    }

    /**
     * Get the icon for the the item
     * @param item a row or an entry with a current state
     * @eturn the icon for the item
     */
    public getActionIcon(item: BackendImportIdentifiedRow | BackendImportEntryObject): string {
        switch (item[`state`] ?? item[`info`]) {
            case BackendImportState.Error: // no import possible
                return `block`;
            case BackendImportState.Warning:
                return `warning`;
            case BackendImportState.New:
                return `add`;
            case BackendImportState.Done: // item will be updated / has been imported
                return this._state !== BackendImportPhase.FINISHED ? `merge` : `done`;
            case BackendImportState.Generated:
                return `autorenew`;
            default:
                return `block`; // fallback: Error
        }
    }

    public getEntryIcon(item: BackendImportEntryObject): string {
        if (item.info === BackendImportState.Done) {
            return undefined;
        }
        return this.getActionIcon(item);
    }

    /**
     * Get the correct tooltip for the item
     * @param entry a row with a current state
     * @eturn the tooltip for the item
     */
    public getRowTooltip(row: BackendImportIdentifiedRow): string {
        switch (row.state) {
            case BackendImportState.Error: // no import possible
                return (
                    this.getErrorDescription(row) ??
                    _(`There is an unspecified error in this line, which prevents the import.`)
                );
            case BackendImportState.Warning:
                return this.getErrorDescription(row) ?? _(`This row will not be imported, due to an unknown reason.`);
            case BackendImportState.New:
                return this.translate.instant(this.modelName) + ` ` + this.translate.instant(`will be imported`);
            case BackendImportState.Done: // item will be updated / has been imported
                return (
                    this.translate.instant(this.modelName) +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will be updated`)
                        : this.translate.instant(`has been imported`))
                );
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
     */
    public selectColSep(event: MatSelectChange): void {
        this._importer.columnSeparator = event.value;
        this._importer.refreshFile();
    }

    /**
     * Trigger for the column separator selection
     */
    public selectTextSep(event: MatSelectChange): void {
        this._importer.textSeparator = event.value;
        this._importer.refreshFile();
    }

    /**
     * Trigger for the encoding selection.
     */
    public selectEncoding(event: MatSelectChange): void {
        this._importer.encoding = event.value;
        this._importer.refreshFile();
    }

    /**
     * Opens a fullscreen dialog with the given template as content.
     */
    public async enterFullscreen(dialogTemplate: TemplateRef<any>): Promise<void> {
        this.isInFullscreen = true;
        const ref = this.dialog.open(dialogTemplate, { width: `80vw` });
        await firstValueFrom(ref.afterClosed());
        this.isInFullscreen = false;
    }

    /**
     * Opens an info dialog with the given template as content.
     */
    public async openDialog(dialogTemplate: TemplateRef<any>): Promise<void> {
        const ref = this.dialog.open(dialogTemplate, infoDialogSettings);
        await firstValueFrom(ref.afterClosed());
    }

    /**
     * Returns the verbose title for a given summary title.
     */
    public getSummaryPointTitle(title: string): string {
        return this._importer.getVerboseSummaryPointTitle(title);
    }

    private setHeaders(data: { default?: ImportListHeaderDefinition[]; preview?: BackendImportHeader[] }): void {
        for (const key of Object.keys(data)) {
            for (const header of data[key] ?? []) {
                if (!this._headers[header.property]) {
                    this._headers[header.property] = { [key]: header };
                } else {
                    this._headers[header.property][key] = header;
                }
            }
        }
    }

    private getErrorDescription(entry: BackendImportIdentifiedRow): string {
        return entry.messages?.map(error => this.translate.instant(this._importer.verbose(error))).join(`,\n `);
    }

    private fillPreviewData(previews: BackendImportPreview[]) {
        if (!previews || !previews.length) {
            this._previewColumns = undefined;
            this._summary = undefined;
            this._rows = undefined;
        } else {
            this._previewColumns = previews[0].headers ?? this._previewColumns;
            this._summary = previews.some(preview => preview.statistics)
                ? previews.flatMap(preview => preview.statistics).filter(point => point?.value)
                : [];
            this._rows = this.calculateRows(previews);
            this.setHeaders({ preview: this._previewColumns });
        }
    }

    private calculateRows(previews: BackendImportPreview[]): BackendImportIdentifiedRow[] {
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
