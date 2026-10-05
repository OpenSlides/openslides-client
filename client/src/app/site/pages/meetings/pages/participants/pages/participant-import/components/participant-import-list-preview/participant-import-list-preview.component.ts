import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    viewChild
} from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { infoDialogSettings, mediumDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { ViewPortService } from '@app/site/services/view-port.service';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ImportListHeaderDefinition } from '@app/ui/modules/import-list';
import { BackendImportPhase } from '@app/ui/modules/import-list/components/via-backend-import-list/backend-import-list.component';
import {
    BackendImportEntryObject,
    BackendImportHeader,
    BackendImportIdentifiedRow,
    BackendImportPreview,
    BackendImportState,
    BackendImportSummary
} from '@app/ui/modules/import-list/definitions/backend-import-preview';
import { ListModule } from '@app/ui/modules/list';
import { ViewListComponent } from '@app/ui/modules/list/components/view-list/view-list.component';
import { ScrollingTableCellDefConfig } from '@app/ui/modules/scrolling-table/directives/scrolling-table-cell-config';
import { START_POSITION } from '@app/ui/modules/scrolling-table/directives/scrolling-table-cell-position';
import { _, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map, Observable, of, Subscription } from 'rxjs';

import { ParticipantImportService } from '../../services/participant-import.service/participant-import.service';
import { ParticipantImportFilterService } from '../../services/participant-import-filter.service';
import { CSVOptionsService } from '../../services/participant-import-preview.service/participant-import-preview-csv-encoding-options.service';
import { ParticipantImportPreviewSearchService } from '../../services/participant-import-search.service';
import { ViewImportedParticipant } from '../../view-models/view-participant-import';
import { ParticipantImportListInfoDialogComponent } from '../participant-import-list-info-dialog/participant-import-list-info-dialog.component';
import { CSVOptionsComponent } from './participant-import-csv-options/participant-import-csv-options.component';

@Component({
    selector: `os-participant-import-list-preview`,
    templateUrl: `./participant-import-list-preview.component.html`,
    styleUrls: [`./participant-import-list-preview.component.scss`],
    imports: [
        HeadBarModule,
        ListModule,
        MatIcon,
        AsyncPipe,
        TranslatePipe,
        MatTooltip,
        MatCheckbox,
        NgClass,
        MatDialogModule,
        MatProgressSpinner,
        MatLabel,
        CSVOptionsComponent
    ]
})
export class ParticipantImportListPreviewComponent implements OnInit, OnDestroy {
    public readonly START_POSITION = START_POSITION;

    public readonly viewList = viewChild.required(ViewListComponent);

    public modelName = `Participant`;
    public importer = inject(ParticipantImportService);
    public filterService = inject(ParticipantImportFilterService);
    public searchService = inject(ParticipantImportPreviewSearchService);
    public csvOptions: CSVOptionsComponent;
    protected activeMeetingIdService = inject(ActiveMeetingIdService);
    protected dialog = inject(MatDialog);
    protected translate = inject(TranslateService);
    protected csvOptionsService = inject(CSVOptionsService);
    public vp = inject(ViewPortService);

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

    public searchFieldInput = input<string>('');

    @Output()
    public searchFilterUpdated = new EventEmitter<string>();

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

    /** The header's order according to how they are displayed on the template file */
    private headersConfig = [
        { header: 'title', size: 50 },
        { header: 'first_name', size: 200 },
        { header: 'last_name', size: 50 },
        { header: 'email', size: 300 },
        { header: 'member_number', size: 50 },
        { header: 'structure_level', size: 500 },
        { header: 'groups', size: 300 },
        { header: 'number', size: 50 },
        { header: 'vote_weight', size: 50 },
        { header: 'gender', size: 50 },
        { header: 'pronoun', size: 50 },
        { header: 'username', size: 50 },
        { header: 'default_password', size: 50 },
        { header: 'is_active', size: 50 },
        { header: 'is_physical_person', size: 50 },
        { header: 'is_present', size: 50 },
        { header: 'locked_out', size: 50 },
        { header: 'saml_id', size: 50 },
        { header: 'home_committee', size: 50 },
        { header: 'external', size: 50 },
        { header: 'comment', size: 500 }
    ];

    private tempPreviewsObservable: Subscription;
    protected importDone: boolean;
    protected _state: BackendImportPhase = BackendImportPhase.LOADING_PREVIEW;
    protected _summary: BackendImportSummary[];
    protected _rows: BackendImportIdentifiedRow[];
    protected _previewColumns: BackendImportHeader[];
    protected _dataSource: Observable<BackendImportIdentifiedRow[]> = of([]);
    protected _defaultColumns: ImportListHeaderDefinition[] = [];
    protected _headers: Record<string, { default?: ImportListHeaderDefinition; preview?: BackendImportHeader }> = {};
    protected _requiredFields: string[] = [];
    protected uploadButton: boolean;
    public constructor(private cd: ChangeDetectorRef) {}

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public ngOnInit(): void {
        this._dataSource = this.importer.previewsObservable.pipe(map(previews => this.calculateRows(previews)));
        this.importer.currentImportPhaseObservable.subscribe(phase => {
            this._state = phase;
            this.importDone = [BackendImportPhase.FINISHED, BackendImportPhase.FINISHED_WITH_WARNING].includes(phase);
        });
        this.csvOptionsService.toggleCSVOptions = true;
        let previousConfig = this.csvOptionsService?.selectedConfig$.value;
        this.csvOptionsService?.selectedConfig$.subscribe(options => {
            if (
                options.columnSeparator !== previousConfig?.columnSeparator ||
                options.encoding !== previousConfig?.encoding ||
                options.textSeparator !== previousConfig?.textSeparator
            ) {
                this.importer.columnSeparator = options.columnSeparator;
                this.importer.encoding = options.encoding;
                this.importer.textSeparator = options.textSeparator;
                this.importer.refreshFile();
                previousConfig = options;
            }
        });
        this.tempPreviewsObservable = this.importer.previewsObservable.subscribe(previews => {
            this._rows = this.calculateRows(previews);
            this.uploadButton = previews?.some(preview => preview.state === 'error') ? true : false;
            this._totalCountObservable = this.dataSource?.pipe(map(items => items?.length));
            if (!(this._state === BackendImportPhase.IMPORTING) && !(this._state === BackendImportPhase.FINISHED)) {
                this.fillPreviewData(previews);
            }
            this.setHeaders({ preview: this._previewColumns });
        });
    }

    /**
     * Resets the importer when leaving the view
     */
    public ngOnDestroy(): void {
        this.csvOptionsService.toggleCSVOptions = false;
        this.importDone = undefined;
        this.tempPreviewsObservable.unsubscribe();
        this.importer.clearPreview();
        this.importer.clearFile();
        this.importer.clearAll();
    }

    // csvReload
    public selectNewFile(event: Event): void {
        this.csvOptionsService.reload(event);
    }

    public openCsvConfig(): void {
        this.viewList().sortFilterBarComponent.closeFilterMenu();
        //
        // TODO:
        /*
        if (this.csvConfigMenu().opened) {
            this.csvOptionsService.open('filterMenu');
            this.csvConfigMenu().close();
            return;
        } else {
            this.csvOptionsService.open('csvConfigMenu');
            this.csvConfigMenu().open();
        }
        */
    }

    /**
     * Gets the style of the column for the given property.
     */
    protected getColumnConfig(propertyName: string): ScrollingTableCellDefConfig {
        const defaultHeader = this._headers[propertyName]?.default;
        const headerConfig = this.headersConfig.find(config => config.header === propertyName);
        const colWidth = defaultHeader?.width ?? (headerConfig ? headerConfig.size : 150);
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

    protected getColorIcon(item: ViewImportedParticipant | BackendImportEntryObject): string {
        switch (item[`state`] ?? item[`info`]) {
            case BackendImportState.Error: // no import possible
                return `red-warning-text`;
            case BackendImportState.Warning:
                return 'warn';
            case BackendImportState.New:
                return 'os-green';
            case BackendImportState.Done: // has been imported / item will be updated
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
            case BackendImportState.Unchanged:
                if (this._state === BackendImportPhase.FINISHED) {
                    return 'os-green';
                }
                return ``;
            default:
                // ad hoc check for updated structure levels and groups
                if ((item['info'] as string) === 'updated') {
                    return 'os-yellow';
                }
                return `block`; // fallback: Error
        }
    }

    protected getSummaryInformation(item: string): string[] {
        return (
            {
                total: ['group', 'accent'],
                error: ['error_outline', 'red-warning-text'],
                warning: ['warning', 'warn'],
                new: ['add_circle_outline', 'os-green'],
                updated: ['autorenew', 'os-yellow'],
                referenced: ['merge', 'accent'],
                unchanged: [``, ``]
            }[item] ?? ['', '']
        );
    }

    protected getEntryIcon(item: BackendImportEntryObject): string {
        if ((item.info === BackendImportState.Done && item['changed'] === undefined) || !item) {
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
                        ? this.translate.instant(`will be created`) // item will be updated
                        : this.translate.instant(`has been created`)) // item has been created
                );
            case BackendImportState.Done:
                return this.updatedRowTooltip();
            case BackendImportState.Unchanged:
                return (
                    this.translate.instant(this.modelName) +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will not be changed`) // item will not be changed
                        : this.translate.instant(`has not been changed`)) // item has not been changed
                );
            case BackendImportState.Referenced:
                return (
                    this.translate.instant(this.modelName) +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will be referenced`) // item will be referenced
                        : this.translate.instant(`has been referenced`)) // item has been referenced
                );
            default:
                return undefined;
        }
    }

    protected updatedRowTooltip(): string {
        return (
            this.translate.instant(this.modelName) +
            ` ` +
            (this._state !== BackendImportPhase.FINISHED
                ? this.translate.instant(`will be updated`) // item will be updated
                : this.translate.instant(`has been updated`))
        ); // item has been updated
    }

    /**
     * The column separator selection.
     */
    protected onColSepChanged(label: string): void {
        this.importer.columnSeparator = this.importer.columnSeparators.find(col => col.label === label)?.value;
        this.importer.refreshFile();
    }

    /**
     * The text separator selection
     */
    protected onTextSeparatorChanged(value: string): void {
        this.importer.textSeparator = value;
        this.importer.refreshFile();
    }

    /**
     * The encoding selection.
     */
    protected onEncodingChanged(value: string): void {
        this.importer.encoding = value;
        this.importer.refreshFile();
    }

    protected fillPreviewData(previews: BackendImportPreview[]): void {
        if (!previews || !previews.length) {
            this._previewColumns = undefined;
            this._summary = undefined;
            this._rows = undefined;
        } else {
            const orderMap = new Map(this.headersConfig.map((property, index) => [property.header, index]));
            this._previewColumns = (previews[0]?.headers ?? this._previewColumns)
                .filter(header => !header.is_hidden)
                .sort((a, b) => {
                    const aIndex = orderMap.get(a.property) ?? this.headersConfig.length;
                    const bIndex = orderMap.get(b.property) ?? this.headersConfig.length;
                    return aIndex - bIndex;
                });
            this.transformSummary(previews);
            this.cd.markForCheck();
        }
    }

    private transformSummary(previews: BackendImportPreview[]): void {
        this._summary = undefined;
        this._summary = previews.some(preview => preview.statistics)
            ? previews.flatMap(preview => preview.statistics).filter(point => point?.value)
            : [];
        const counts = [0, 0];
        this.rows.filter(participant => {
            if (participant.state === BackendImportState.Done) {
                counts[0] += 1;
            } else if (participant.state === BackendImportState.Referenced) {
                counts[1] += 1;
            }
        });
        const error = this._summary.find(item => item.name === 'error');
        const addIfMissing: (...items: any[]) => void = (...items) => {
            for (const [name, value] of items) {
                if (value > 0 && !this._summary.some(item => item.name === name)) {
                    this._summary.push({ name, value });
                }
            }
        };
        this._summary.map(item => {
            if (item.name === 'created') {
                item.name = 'new';
            }
            if (counts[0] > 0 && item.name === 'updated') {
                item.value = counts[0];
            } else {
                this._summary = this.summary.filter(item => item.name !== 'updated');
            }
            if (counts[1] > 0 && item.name === 'referenced') {
                item.value = counts[1];
            } else {
                this._summary = this.summary.filter(item => item.name !== 'referenced');
            }
        });
        addIfMissing(['updated', counts[0]], ['referenced', counts[1]]);
        this._summary = this._summary.filter(item => item.name !== 'error');
        this._summary.push({ name: error?.name, value: error?.value });
    }

    protected calculateRows(previews: BackendImportPreview[]): ViewImportedParticipant[] {
        return previews?.flatMap(preview =>
            preview.rows.map(row => {
                const participant = new ViewImportedParticipant(row.id, row, this.activeMeetingIdService.meetingId);
                this.isReferenced(participant);
                this.isUnchanged(participant);
                return participant;
            })
        );
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
        const customOptions = {
            width: `600px`,
            disableClose: false,
            maxWidth: `90vw`,
            maxHeight: `90vh`
        };
        const ref = this.dialog.open(dialogTemplate, {
            data: this.summary,
            ...customOptions,
            hasBackdrop: false
        });
        try {
            if (await this.importer.doImport()) {
                // The close() is needed here so dialogs don't overlap if the second one opens
                ref.close();
                this.dialog
                    .open(summaryDialog, {
                        data: this.summary,
                        ...customOptions
                    })
                    .afterClosed();
            }
        } catch {}
        this.cd.detectChanges();
        ref.close();
    }

    protected isReferenced(row: ViewImportedParticipant): boolean {
        if (row.state === 'error') return false;
        if (row.data?.['username']['info'] === 'referenced') {
            row.setState = BackendImportState.Referenced;
            return true;
        }
        return false;
    }

    protected isUnchanged(item: ViewImportedParticipant): boolean {
        if (![BackendImportState.Done, BackendImportState.Referenced].includes(item.state)) {
            return false;
        }
        if (this.checkChanges(item) === false) {
            item.setState = BackendImportState.Unchanged;
            return true;
        }
        return false;
    }

    protected checkChanges(participant: ViewImportedParticipant, headerName?: string): boolean | [string, {}] {
        const changes = {};
        for (const key of Object.keys(participant.data)) {
            if (Array.isArray(participant.data[key])) {
                participant.data[key].map(item => {
                    if (item?.['changed'] === true) {
                        changes[key] = item;
                    }
                });
            } else {
                if (participant.data[key]?.['changed'] === true) {
                    changes[key] = participant.data[key];
                }
            }
        }
        // check for displaying the icon on every entry and provide context if an entry is removed
        if (Object.keys(changes).includes(headerName)) {
            return ['autorenew', changes];
        }
        // check for unchanged users
        if (Object.keys(changes).length === 0) {
            return false;
        }
        // check for displaying the updated icon if participant is referenced
        if (participant.state === 'referenced' && Object.keys(changes).length > 0) {
            return true;
        }
        return false;
    }
}
