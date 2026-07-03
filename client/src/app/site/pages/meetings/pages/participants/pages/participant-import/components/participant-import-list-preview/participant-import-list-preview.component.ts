import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { _, TranslateService } from '@ngx-translate/core';
import { map, Observable, of, Subscription } from 'rxjs';
import { ValueLabelCombination } from 'src/app/infrastructure/utils/import/import-utils';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { AccountControllerService } from 'src/app/site/pages/organization/pages/accounts/services/common/account-controller.service';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        HeadBarModule,
        ListModule,
        MatIcon,
        AsyncPipe,
        MatTooltip,
        MatCheckbox,
        NgClass,
        MatDialogModule,
        MatProgressSpinner
    ]
})
export class ParticipantImportListPreviewComponent implements OnInit, OnDestroy {
    public readonly END_POSITION = END_POSITION;
    public readonly START_POSITION = START_POSITION;

    protected activeMeetingIdService = inject(ActiveMeetingIdService);
    protected accountsControllerService = inject(AccountControllerService);

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

    @Output()
    public selectedTabChanged = new EventEmitter<number>();

    /**
     * Defines all necessary and optional fields, that a .csv-file can contain.
     */
    @Input()
    public possibleFields: string[] = [];

    protected _totalCountObservable: Observable<number> = null;

    /**
     * Whether or not to show the filter bar
     */
    public showFilterBar = true;

    /**
     * Whether or not to allow horizontal scroll
     */
    public horizontalScroll = true;

    /**
     * Whether or not to show the header
     */
    public showHeader = true;

    /**
     * Whether or not to show the CSV-Encoding button
     */
    protected csvConfiguration = true;

    /**
     * Whether or not to show the CSV-Reload button
     */
    protected csvReloadButton = true; // Reload CSV file

    protected userAccounts = this.accountsControllerService.getViewModelList();

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
    public selectedEncoding: string;

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
     * Currently selected column separator. Is set and changed by the config's available
     * column separators and user mat-select input
     */
    public selectedColumnSeparator;

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
    private _rows: ViewImportedParticipant[];
    private _previewColumns: BackendImportHeader[];

    private _dataSource: Observable<BackendImportIdentifiedRow[]> = of([]);
    private _requiredFields: string[] = [];
    private _defaultColumns: ImportListHeaderDefinition[] = [];

    private _headers: Record<string, { default?: ImportListHeaderDefinition; preview?: BackendImportHeader }> = {};
    protected uploadButton: boolean;
    private tempPreviewsObservable: Subscription;

    public constructor(
        private dialog: MatDialog,
        private router: Router,
        protected translate: TranslateService,
        protected readonly controller: ParticipantControllerService,
        private cd: ChangeDetectorRef
    ) {}

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public ngOnInit(): void {
        /* TODO: REMOVE THE MANUAL STATISTICS' CALCULATION */
        this._dataSource = this.importer.previewsObservable.pipe(map(previews => this.calculateRows(previews)));
        this._requiredFields = this.createRequiredFields();
        this.importer.currentImportPhaseObservable.subscribe(phase => {
            this._state = phase;
        });
        this.tempPreviewsObservable = this.importer.previewsObservable.subscribe(previews => {
            this._rows = this.calculateRows(previews);
            this.uploadButton = previews?.some(preview => preview.state === 'error') ? true : false;
            this.fillPreviewData(previews);
        });
        this._totalCountObservable = this._dataSource.pipe(map(items => items.length));
        this.searchService = new ListSearchService(this.filterProps, this.alsoFilterByProperties);
        this.setHeaders({ preview: this._previewColumns });
    }

    /**
     * Resets the importer when leaving the view
     */
    public ngOnDestroy(): void {
        this.importer.clearPreview();
        this.importer.clearFile();
        this.importer.clearAll();
    }

    /**
     * Triggers a change in the tab group: Clearing the preview selection
     */
    protected onTabChange({ index }: MatTabChangeEvent): void {
        this.importer.clearAll();
        this.selectedTabChanged.emit(index);
    }

    /**
     * True if there are custom tabs.
     */
    protected hasSeveralTabs(): boolean {
        return this.importListFirstTabs.length + this.importListLastTabs.length > 0;
    }

    /**
     * triggers the importer's onSelectFile after a file has been chosen
     */
    // not working, fix this
    protected onSelectFile(event: any): void {
        this.uploadButton = false;
        this.importer.onSelectFile(event);
    }

    /**
     * Gets the relevant backend header information for a property.
     */
    protected getHeader(propertyName: string): BackendImportHeader {
        return this._headers[propertyName]?.preview;
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
                return this._state !== BackendImportPhase.FINISHED ? 'merge' : 'done';
            case BackendImportState.Generated:
                return `merge`;
            case BackendImportState.Remove:
                return `remove`;
            default:
                return `block`; // fallback: Error
        }
    }

    /**
     * Get the icon for the the entry
     * @param item a row or an entry with a current state
     * @return the icon for the item
     */
    protected getActionIconEntry(item: BackendImportEntryObject): string {
        switch (item[`info`]) {
            case BackendImportState.Error: // no import possible
                return `error_outline`;
            case BackendImportState.Warning:
                return `warning`;
            case BackendImportState.New: // item will be imported / has been imported
                return this._state !== BackendImportPhase.FINISHED ? `add_circle_outline` : `done`;
            case BackendImportState.Done:
                return this._state !== BackendImportPhase.FINISHED ? `merge` : `done`;
            case BackendImportState.Generated:
                return `merge`;
            case BackendImportState.Remove:
                return `remove`;
            default:
                return `block`; // fallback: Error
        }
    }

    protected getColorIcon(item: ViewImportedParticipant | BackendImportEntryObject): string {
        switch (item[`state`] ?? item[`info`]) {
            case BackendImportState.Error: // no import possible
                return `red-warning-text`;
            case BackendImportState.Warning:
                return 'warning';
            case BackendImportState.New:
                return 'os-green';
            case BackendImportState.Done: // item will be updated / has been imported
                if (this._state === BackendImportPhase.FINISHED) {
                    return 'os-green';
                }
                return 'os-yellow';
            case BackendImportState.Referenced:
                if (this._state === BackendImportPhase.FINISHED) {
                    return 'os-green';
                }
                return 'accent';
            case BackendImportState.Generated:
                return `accent`;
            default:
                return `block`; // fallback: Error
        }
    }

    protected getSummaryInformation(item: string): string[] {
        return (
            {
                total: ['group', 'accent'],
                error: ['error_outline', 'red-warning-text'],
                warning: ['warning', 'warn'],
                created: ['add_circle_outline', 'os-green'],
                updated: ['autorenew', 'os-yellow'],
                referenced: ['merge', 'accent']
            }[item] ?? ['', '']
        );
    }

    protected getEntryIcon(item: BackendImportEntryObject): string {
        if (item.info === BackendImportState.Done || !item) {
            return undefined;
        }
        return this.getActionIconEntry(item);
    }

    protected containsError(entry: any, def: string): boolean {
        this.cd.markForCheck();
        const value = entry?.[def];
        if (!value) return false;
        if (Array.isArray(value)) {
            return value.some(icon => this.getEntryIcon(icon) === 'error_outline');
        }
        return this.getEntryIcon(value) === 'error_outline';
    }

    /**
     * Get the correct tooltip for the item
     * @param entry a row with a current state
     * @eturn the tooltip for the item
     */
    protected getRowTooltip(row: ViewImportedParticipant): string {
        switch (row.state) {
            case BackendImportState.Error: // no import possible
                return (
                    this.getErrorDescription(row) ??
                    _(`There is an unspecified error in this line, which prevents the import.`)
                );
            case BackendImportState.Warning:
                return this.getErrorDescription(row) ?? _(`The affected columns will not be imported.`);
            case BackendImportState.New:
                return (
                    this.translate.instant(this.modelName) +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will be imported`) // item will be updated
                        : this.translate.instant(`has been imported`)) // item has been imported
                );
            case BackendImportState.Done:
                return (
                    this.translate.instant(this.modelName) +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will be updated`) // item will be updated
                        : this.translate.instant(`has been imported`)) // item has been imported
                );
            case BackendImportState.Referenced:
                return (
                    this.translate.instant(this.modelName) +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will be referenced`) // item will be referenced
                        : this.translate.instant(`has been imported`)) // item has been imported
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
     * The column separator selection.
     */
    protected onColSepChanged(label: string): void {
        this.importer.columnSeparator = this.importer.columnSeparators.find(col => col.label === label)?.value;
    }

    /**
     * The text separator selection
     */
    protected onTextSeparatorChanged(value: string): void {
        this.importer.textSeparator = value;
    }

    /**
     * The encoding selection.
     */
    protected onEncodingChanged(value: string): void {
        this.importer.encoding = value;
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
            this._previewColumns = (previews[0]?.headers ?? this._previewColumns).filter(
                header => !header[`is_hidden`]
            );
            this.transformSummary(previews);
            this.cd.markForCheck();
        }
    }

    private transformSummary(previews: BackendImportPreview[]): void {
        this._summary = undefined;
        this._summary = previews.some(preview => preview.statistics)
            ? previews.flatMap(preview => preview.statistics).filter(point => point?.value)
            : [];
        const countReferenced = this._rows.filter(row => row.state === BackendImportState.Referenced).length | 0;
        const countUpdated =
            this._rows.filter(row => this.isReferenced(row) === false && row.state === 'done').length | 0;
        if (countReferenced > 0) {
            const error = this._summary.find(item => item.name === 'error');
            this._summary = this._summary.filter(item => item.name !== 'updated');
            this._summary = this._summary.filter(item => item.name !== 'error');
            if (countUpdated > 0) {
                this._summary.push({ name: 'updated', value: countUpdated });
            }
            this._summary.push({ name: 'referenced', value: countReferenced });
            this._summary.push({ name: error?.name, value: error?.value });
        }
    }

    private calculateRows(previews: BackendImportPreview[]): ViewImportedParticipant[] {
        return previews?.flatMap(preview =>
            preview.rows.map(row => {
                const participant = new ViewImportedParticipant(row.id, row, this.activeMeetingIdService.meetingId);
                this.isReferenced(participant);
                return participant;
            })
        );
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

    /**
     * Summary adapted to the footer. Displays only "created", "updated", "referenced" and "error" columns.
     * @param summary
     * @returns BackendImportSummary[]
     */
    protected shortenSummary(summary: BackendImportSummary[]): BackendImportSummary[] {
        return summary?.filter(
            col => col.name !== 'structure levels created' && col.name !== 'groups created' && col.name !== 'warning'
        );
    }

    protected summaryRest(summary: BackendImportSummary[]): BackendImportSummary[] {
        return summary?.filter(col => col.name === 'structure levels created' || col.name === 'groups created');
    }

    protected async importData(dialogTemplate: TemplateRef<string>, summaryDialog: TemplateRef<string>): Promise<void> {
        this.tempPreviewsObservable.unsubscribe();
        const customOptions = {
            width: `600px`,
            disableClose: false,
            maxWidth: `90vw`,
            maxHeight: `90vh`
        };
        const sleep: (ms: number) => Promise<unknown> = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const ref = this.dialog.open(dialogTemplate, {
            data: this.summary,
            ...customOptions,
            hasBackdrop: false
        });
        try {
            await sleep(2000);
            if (await this.importer.doImport()) {
                // The close() is needed here so dialogs don't overlap if the second one opens
                ref.close();
                this.dialog
                    .open(summaryDialog, {
                        data: this.summary,
                        ...customOptions
                    })
                    .afterClosed()
                    .subscribe(() => this.redirect());
            }
        } catch {}
        this.cd.detectChanges();
        ref.close();
    }

    private redirect(): void {
        this.router.navigateByUrl(this.router.url.replace('/import/preview', ''));
    }

    private isReferenced(row: ViewImportedParticipant): boolean {
        for (const user of this.userAccounts) {
            if (
                (user.meeting_ids.includes(row.meeting_id) && row.username && row.username === user.username) ||
                (row.member_number && row.member_number === user.member_number) ||
                (row.saml_id && row.saml_id === user.saml_id)
            ) {
                return false;
            }
        }
        if (row.state !== 'done') {
            return false;
        }
        row.setState = BackendImportState.Referenced;
        return true;
    }
}
