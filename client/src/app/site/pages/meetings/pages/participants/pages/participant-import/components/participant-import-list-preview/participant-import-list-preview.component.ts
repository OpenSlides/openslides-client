import { AsyncPipe, NgClass } from '@angular/common';
import {
    Component,
    ContentChild,
    ContentChildren,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef
} from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSelectChange } from '@angular/material/select';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { _, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map, Observable, of } from 'rxjs';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ValueLabelCombination } from 'src/app/infrastructure/utils/import/import-utils';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';
import { BackendImportPhase } from 'src/app/ui/modules/import-list/components/via-backend-import-list/backend-import-list.component';
import {
    BackendImportEntryObject,
    BackendImportHeader,
    BackendImportIdentifiedRow,
    BackendImportPreview,
    BackendImportState,
    BackendImportSummary
} from 'src/app/ui/modules/import-list/definitions/backend-import-preview';
import { ImportListFirstTabDirective } from 'src/app/ui/modules/import-list/directives/import-list-first-tab.directive';
import { ImportListLastTabDirective } from 'src/app/ui/modules/import-list/directives/import-list-last-tab.directive';
import { ImportListStatusTemplateDirective } from 'src/app/ui/modules/import-list/directives/import-list-status-template.directive';
import { ListModule } from 'src/app/ui/modules/list';
import { ListSearchService } from 'src/app/ui/modules/list/services/list-search.service';
import { ScrollingTableCellDefConfig } from 'src/app/ui/modules/scrolling-table/directives/scrolling-table-cell-config';
import {
    END_POSITION,
    START_POSITION
} from 'src/app/ui/modules/scrolling-table/directives/scrolling-table-cell-position';

import { ParticipantControllerService } from '../../../../services/common/participant-controller.service';
import { ParticipantImportService } from '../../services/participant-import.service/participant-import.service';
import { ParticipantImportFilterService } from '../../services/participant-import-filter.service';
import { ParticipantImportPreviewSearchService } from '../../services/participant-import-search.service';
import { ViewImportedParticipant } from '../../view-models/view-participant-import';

@Component({
    selector: `os-participant-import-list-preview`,
    templateUrl: `./participant-import-list-preview.component.html`,
    styleUrls: [`./participant-import-list-preview.component.scss`],
    imports: [HeadBarModule, ListModule, MatIcon, AsyncPipe, MatTooltip, MatCheckbox, NgClass]
})
export class ParticipantImportListPreviewComponent implements OnInit, OnDestroy {
    public readonly END_POSITION = END_POSITION;
    public readonly START_POSITION = START_POSITION;

    @ContentChildren(ImportListFirstTabDirective)
    public importListFirstTabs!: QueryList<ImportListFirstTabDirective>;

    @ContentChildren(ImportListLastTabDirective)
    public importListLastTabs!: QueryList<ImportListLastTabDirective>;

    @ContentChild(ImportListStatusTemplateDirective, { read: TemplateRef })
    public importListStateTemplate: TemplateRef<any>;

    @Input()
    public rowHeight = 20;

    public modelName = `Participant`;

    @Input()
    public additionalInfo = ``;

    @Input()
    public importer = inject(ParticipantImportService);

    /**
     * Define extra filter properties
     */
    protected get filterProps(): string[] {
        return ViewImportedParticipant.REQUESTABLE_FIELDS;
    }

    public filterService = inject(ParticipantImportFilterService);
    public alsoFilterByProperties: string[] = [`id`];
    public searchService = inject(ParticipantImportPreviewSearchService);

    @Input()
    public searchFieldInput = ``;

    @Output()
    public searchFilterUpdated = new EventEmitter<string>();

    protected _totalCountObservable: Observable<number> = null;

    /**
     * Whether or not to show the filter bar
     */
    public showFilterBar = true;

    /**
     * Whether or not to show the header
     */
    public showHeader = true;

    /**
     * Whether or not to show the CSV-Encoding button
     */
    protected csvConfiguration = true;

    /**
     * Whether or not to show the CSV-
     */
    protected csvReload = true; // Reload CSV file

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
        return this.importer?.rawFileObservable || of(null);
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

    /**
     * @returns the encodings available and their labels
     */
    public get encodings(): ValueLabelCombination[] {
        return this.importer.encodings;
    }

    /**
     * @returns the available column separators and their labels
     */
    public get columnSeparators(): ValueLabelCombination[] {
        return this.importer.columnSeparators;
    }

    /**
     * @eturns the available text separators and their labels
     */
    public get textSeparators(): ValueLabelCombination[] {
        return this.importer.textSeparators;
    }

    /**
     * If false there is something wrong with the data.
     */
    public get hasRowErrors(): boolean {
        return this.importer.previewHasRowErrors;
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

    private _headers: Record<string, { default?: ImportListHeaderDefinition; preview?: BackendImportHeader }> = {};
    protected uploadButton: boolean;

    public importedParticipants: Observable<ViewImportedParticipant[]>;

    public constructor(
        private dialog: MatDialog,
        protected translate: TranslateService,
        protected readonly controller: ParticipantControllerService
    ) {}

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public ngOnInit(): void {
        this._requiredFields = this.createRequiredFields();
        this.importer.currentImportPhaseObservable.subscribe(phase => {
            this._state = phase;
        });
        this.importer.previewsObservable.subscribe(previews => {
            this.fillPreviewData(previews);
        });
        this._dataSource = this.importer.previewsObservable.pipe(map(previews => this.calculateRows(previews)));
        this._totalCountObservable = this._dataSource.pipe(map(items => items.length));
        this.searchService = new ListSearchService(this.filterProps, this.alsoFilterByProperties);
    }

    /**
     * Resets the importer when leaving the view
     */
    public ngOnDestroy(): void {
        this.importer.clearAll();
        this.importer.clearFile();
    }

    /**
     * Triggers a change in the tab group: Clearing the preview selection
     */
    public onTabChange({ index }: MatTabChangeEvent): void {
        this.importer.clearAll();
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
        this.uploadButton = false;
        this.importer.onSelectFile(event);
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
     * @return the icon for the item
     */
    public getActionIcon(item: ViewImportedParticipant | BackendImportEntryObject): string {
        switch (item[`state`] ?? item[`info`]) {
            case BackendImportState.Error: // no import possible
                return `error_outline`;
            case BackendImportState.Warning:
                return `warning`;
            case BackendImportState.New:
                return `add_circle_outline`;
            case BackendImportState.Done: // item will be updated / has been imported
                return this._state !== BackendImportPhase.FINISHED ? `autorenew` : `done`;
            case BackendImportState.Generated:
                return `merge`;
            case BackendImportState.Remove:
                return `remove`;
            default:
                return `block`; // fallback: Error
        }
    }

    public getColorIcon(item: ViewImportedParticipant | BackendImportEntryObject): string {
        switch (item[`state`] ?? item[`info`]) {
            case BackendImportState.Error: // no import possible
                return `red-warning-text`;
            case BackendImportState.Warning:
                return 'warning';
            case BackendImportState.New:
                return 'os-green';
            case BackendImportState.Done: // item will be updated / has been imported
                return this._state !== BackendImportPhase.FINISHED ? `os-yellow` : `accent`;
            case BackendImportState.Generated:
                return `accent`;
            default:
                return `block`; // fallback: Error
        }
    }

    public getEntryIcon(item: BackendImportEntryObject): string {
        if (item.info === BackendImportState.Done || !item) {
            return undefined;
        }
        return this.getActionIcon(item);
    }

    /**
     * Get the correct tooltip for the item
     * @param entry a row with a current state
     * @eturn the tooltip for the item
     */
    public getRowTooltip(row: ViewImportedParticipant): string {
        switch (row.state) {
            case BackendImportState.Error: // no import possible
                return (
                    this.getErrorDescription(row) ??
                    _(`There is an unspecified error in this line, which prevents the import.`)
                );
            case BackendImportState.Warning:
                return this.getErrorDescription(row) ?? _(`The affected columns will not be imported.`);
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

    public getWarningRowTooltip(row: ViewImportedParticipant): string {
        switch (row.state) {
            case BackendImportState.Error: // no import possible
                return (
                    this.getErrorDescription(row) ??
                    _(`There is an unspecified error in this line, which prevents the import.`)
                );
            default:
                return this.getErrorDescription(row) ?? _(`The affected columns will not be imported.`);
        }
    }

    /**
     * A function to trigger the csv example download.
     */
    public downloadCsvExample(): void {
        this.importer.downloadCsvExample();
    }

    /**
     * Trigger for the column separator selection.
     */
    public selectColSep(event: MatSelectChange): void {
        this.importer.columnSeparator = event.value;
        this.importer.refreshFile();
    }

    /**
     * Trigger for the column separator selection
     */
    public selectTextSep(event: MatSelectChange): void {
        this.importer.textSeparator = event.value;
        this.importer.refreshFile();
    }

    /**
     * Trigger for the encoding selection.
     */
    public selectEncoding(event: MatSelectChange): void {
        this.importer.encoding = event.value;
        this.importer.refreshFile();
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
        return this.importer.getVerboseSummaryPointTitle(title);
    }

    public getShortenedDecimal(decimalString: string): string {
        while (decimalString.length && [`0`, `.`].includes(decimalString.charAt(decimalString.length - 1))) {
            decimalString = decimalString.substring(0, decimalString.length - 1);
        }
        return decimalString;
    }

    public isString(value: any): value is string {
        return typeof value === `string`;
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

    private getErrorDescription(entry: ViewImportedParticipant): string {
        return entry.messages?.map(error => this.translate.instant(this.importer.verbose(error))).join(`\n `);
    }

    private fillPreviewData(previews: BackendImportPreview[]): void {
        if (!previews || !previews.length) {
            this._previewColumns = undefined;
            this._summary = undefined;
            this._rows = undefined;
        } else {
            this._previewColumns = (previews[0].headers ?? this._previewColumns).filter(header => !header[`is_hidden`]);
            this._summary = previews.some(preview => preview.statistics)
                ? previews.flatMap(preview => preview.statistics).filter(point => point?.value)
                : [];
            this._rows = this.calculateRows(previews);
            this.setHeaders({ preview: this._previewColumns });
        }
    }

    private calculateRows(previews: BackendImportPreview[]): ViewImportedParticipant[] {
        return previews?.flatMap(preview => preview.rows.map(row => new ViewImportedParticipant(row.id, row)));
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
