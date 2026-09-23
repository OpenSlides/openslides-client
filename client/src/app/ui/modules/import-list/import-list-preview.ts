import { Directive, inject, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { infoDialogSettings, mediumDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { ParticipantImportListInfoDialogComponent } from '@app/site/pages/meetings/pages/participants/pages/participant-import/components/participant-import-list-info-dialog/participant-import-list-info-dialog.component';
import { ViewImportedParticipant } from '@app/site/pages/meetings/pages/participants/pages/participant-import/view-models/view-participant-import';
import { BackendImportService } from '@app/ui/base/import-service';
import { _, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Observable, of } from 'rxjs';

import { ScrollingTableCellDefConfig } from '../scrolling-table/directives/scrolling-table-cell-config';
import { ImportListHeaderDefinition } from './definitions';
import {
    BackendImportEntryObject,
    BackendImportHeader,
    BackendImportIdentifiedRow,
    BackendImportPreview,
    BackendImportState,
    BackendImportSummary
} from './definitions/backend-import-preview';

export enum BackendImportPhase {
    LOADING_PREVIEW,
    AWAITING_CONFIRM,
    IMPORTING,
    FINISHED,
    ERROR,
    FINISHED_WITH_WARNING
}

@Directive()
export abstract class ImportListPreview implements OnInit {
    protected dialog = inject(MatDialog);
    protected translate = inject(TranslateService);
    protected _state: BackendImportPhase = BackendImportPhase.LOADING_PREVIEW;
    protected _summary: BackendImportSummary[];
    protected _rows: BackendImportIdentifiedRow[];
    protected _previewColumns: BackendImportHeader[];
    protected _dataSource: Observable<BackendImportIdentifiedRow[]> = of([]);
    protected _defaultColumns: ImportListHeaderDefinition[] = [];
    protected _headers: Record<string, { default?: ImportListHeaderDefinition; preview?: BackendImportHeader }> = {};
    protected _requiredFields: string[] = [];
    protected uploadButton: boolean;
    public abstract modelName: string;
    public abstract importer: BackendImportService;
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

    public ngOnInit(): void {
        this.uploadButton = true;
    }

    /**
     * Gets the style of the column for the given property.
     */
    protected getColumnConfig(propertyName: string): ScrollingTableCellDefConfig {
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
    protected getColumnLabel(propertyName: string): string {
        return this._headers[propertyName]?.default?.label ?? propertyName;
    }

    /**
     * Get the icon for the the item
     * @param item a row or an entry with a current state
     * @eturn the icon for the item
     */
    protected getActionIcon(item: BackendImportIdentifiedRow | BackendImportEntryObject): string {
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
            case BackendImportState.Remove:
                return `remove`;
            default:
                return `block`; // fallback: Error
        }
    }

    protected getEntryIcon(item: BackendImportEntryObject): string {
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
    protected getRowTooltip(row: BackendImportIdentifiedRow): string {
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

    public getWarningRowTooltip(row: BackendImportIdentifiedRow): string {
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
     * Opens an info dialog with the given template as content.
     */
    public async openDialog(dialogTemplate?: TemplateRef<any>): Promise<void> {
        const ref = this.dialog.open(dialogTemplate ?? ParticipantImportListInfoDialogComponent, {
            ...infoDialogSettings,
            width: dialogTemplate ? undefined : mediumDialogSettings.width
        });
        await firstValueFrom(ref.afterClosed());
    }

    /**
     * Returns the verbose title for a given summary title.
     */
    protected getSummaryPointTitle(title: string): string {
        return this.importer.getVerboseSummaryPointTitle(title);
    }

    protected isString(value: any): value is string {
        return typeof value === `string`;
    }

    protected setHeaders(data: { default?: ImportListHeaderDefinition[]; preview?: BackendImportHeader[] }): void {
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

    protected getErrorDescription(entry: BackendImportIdentifiedRow): string {
        return entry.messages?.map(error => this.translate.instant(this.importer.verbose(error))).join(`\n `);
    }

    protected fillPreviewData(previews: BackendImportPreview[]): void {
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

    protected createRequiredFields(): string[] {
        const definitions = this._defaultColumns;
        if (Array.isArray(definitions) && definitions.length > 0) {
            return definitions
                .filter(definition => definition.isRequired as boolean)
                .map(definition => definition.property as string);
        } else {
            return [];
        }
    }

    /**
     * Gets the relevant backend header information for a property.
     */
    protected getHeader(propertyName: string): BackendImportHeader {
        return this._headers[propertyName]?.preview;
    }

    /**
     * Get the icon for the the item
     * @param item a row with a current state
     * @return the icon for the item
     */
    protected getActionIconRow(item: ViewImportedParticipant): string {
        switch (item[`state`]) {
            case BackendImportState.Error: // no import possible
                return this._state !== BackendImportPhase.FINISHED ? `error_outline` : 'close';
            case BackendImportState.Warning:
                return `warning`;
            case BackendImportState.New: // item will be imported / has been imported
                return this._state !== BackendImportPhase.FINISHED ? `add_circle_outline` : `done`;
            case BackendImportState.Done:
                return this._state !== BackendImportPhase.FINISHED ? 'autorenew' : 'done';
            case BackendImportState.Referenced:
                return this._state !== BackendImportPhase.FINISHED ? 'merge' : `done`;
            case BackendImportState.Generated:
                return ``;
            case BackendImportState.Remove:
                return ``;
            case BackendImportState.Unchanged:
                return this._state !== BackendImportPhase.FINISHED ? '' : `done`;
            default:
                return `block`; // fallback: Error
        }
    }

    /**
     * Get the icon for the the entry
     * @param item an entry with a current state
     * @return the icon for the item
     */
    protected getActionIconEntry(item: BackendImportEntryObject): string {
        switch (item.info) {
            case BackendImportState.Error: // no import possible
                return `error_outline`;
            case BackendImportState.Warning:
                return `warning`;
            case BackendImportState.New:
                return `add_circle_outline`;
            case BackendImportState.Done:
                if (item['changed'] === true) {
                    return 'autorenew';
                }
                return '';
            case BackendImportState.Generated:
                return ``;
            case BackendImportState.Remove:
                return `remove_circle_outline`;
            case BackendImportState.Referenced:
                return ``;
            default:
                // ad hoc check for updated structure levels and groups
                if ((item.info as string) === 'updated') {
                    return 'autorenew';
                }
                return 'mood_bad';
        }
    }

    public getShortenedDecimal(decimalString: string): string {
        while (decimalString?.length && [`0`, `.`].includes(decimalString?.charAt(decimalString?.length - 1))) {
            decimalString = decimalString?.substring(0, decimalString?.length - 1);
        }
        return decimalString;
    }

    protected calculateRows(previews: BackendImportPreview[]): BackendImportIdentifiedRow[] {
        return previews?.flatMap(preview => preview.rows);
    }
}
