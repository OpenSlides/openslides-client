import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    inject,
    input,
    OnDestroy,
    OnInit,
    output,
    TemplateRef,
    viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatDrawer } from '@angular/material/sidenav';
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
import { ParticipantImportPreviewSearchService } from '../../services/participant-import-search.service';
import { ViewImportedParticipant } from '../../view-models/view-participant-import';
import { ParticipantImportListInfoDialogComponent } from '../participant-import-list-info-dialog/participant-import-list-info-dialog.component';

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
        MatRadioGroup,
        MatDivider,
        MatRadioButton,
        MatDrawer,
        FormsModule,
        CommonModule
    ]
})
export class ParticipantImportListPreviewComponent implements OnInit, OnDestroy {
    public readonly START_POSITION = START_POSITION;

    public readonly viewList = viewChild.required(ViewListComponent);
    public readonly csvConfigMenu = viewChild.required<MatDrawer>(MatDrawer);

    protected searchFieldInput = input<string>('');
    protected searchFilterUpdated = output<string>();

    protected totalCount: number = null;
    protected importDone: boolean;
    protected summary: BackendImportSummary[];
    protected previewColumns: BackendImportHeader[];
    protected dataSource: Observable<BackendImportIdentifiedRow[]> = of([]);
    protected uploadButton: boolean;
    protected selectedEncoding = 'utf-8';
    protected selectedColumnSeparator = '';
    protected selectedTextSeparator = '"';

    private _headers: Record<string, { default?: ImportListHeaderDefinition; preview?: BackendImportHeader }> = {};
    private _state: BackendImportPhase = BackendImportPhase.LOADING_PREVIEW;
    private rows: BackendImportIdentifiedRow[];
    private tempPreviewsObservable: Subscription;
    private importPhaseObservable: Subscription;
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

    public importer = inject(ParticipantImportService);
    public filterService = inject(ParticipantImportFilterService);
    public searchService = inject(ParticipantImportPreviewSearchService);
    public vp = inject(ViewPortService);
    protected activeMeetingIdService = inject(ActiveMeetingIdService);
    protected dialog = inject(MatDialog);
    protected translate = inject(TranslateService);
    private cd = inject(ChangeDetectorRef);

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public ngOnInit(): void {
        this.dataSource = this.importer.previewsObservable.pipe(map(previews => this.calculateRows(previews)));
        this.importPhaseObservable = this.importer.currentImportPhaseObservable.subscribe(phase => {
            this._state = phase;
            this.importDone = [BackendImportPhase.FINISHED, BackendImportPhase.FINISHED_WITH_WARNING].includes(phase);
        });
        this.tempPreviewsObservable = this.importer.previewsObservable.subscribe(previews => {
            this.rows = this.calculateRows(previews);
            this.totalCount = this.rows?.length;
            this.uploadButton = previews?.some(preview => preview.state === 'error') ?? false;
            if (
                !(this._state === BackendImportPhase.IMPORTING) &&
                !(
                    this._state === BackendImportPhase.FINISHED ||
                    this._state === BackendImportPhase.FINISHED_WITH_WARNING
                )
            ) {
                this.fillPreviewData(previews);
            }
            this.setHeaders({ preview: this.previewColumns });
        });
    }

    /**
     * Resets the importer when leaving the view
     */
    public ngOnDestroy(): void {
        this.importDone = undefined;
        this.tempPreviewsObservable.unsubscribe();
        this.importPhaseObservable.unsubscribe();
        this.importer.clearPreview();
        this.importer.clearFile();
        this.importer.clearAll();
    }

    public openCsvConfig(): void {
        const menu = this.csvConfigMenu();
        if (menu.opened) {
            menu.close();
        } else {
            menu.open();
            this.viewList().sortFilterBarComponent.closeFilterMenu();
        }
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
                    this.translate.instant('Participant') +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will be created`) // item will be updated
                        : this.translate.instant(`has been created`)) // item has been created
                );
            case BackendImportState.Done:
                return this.updatedRowTooltip();
            case BackendImportState.Unchanged:
                return (
                    this.translate.instant('Participant') +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will not be changed`) // item will not be changed
                        : this.translate.instant(`has not been changed`)) // item has not been changed
                );
            case BackendImportState.Referenced:
                return (
                    this.translate.instant('Participant') +
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
            this.translate.instant('Participant') +
            ` ` +
            (this._state !== BackendImportPhase.FINISHED
                ? this.translate.instant(`will be updated`) // item will be updated
                : this.translate.instant(`has been updated`))
        ); // item has been updated
    }

    protected fillPreviewData(previews: BackendImportPreview[]): void {
        if (!previews || !previews.length) {
            this.previewColumns = undefined;
            this.summary = undefined;
            this.rows = undefined;
        } else {
            const orderMap = new Map(this.headersConfig.map((property, index) => [property.header, index]));
            this.previewColumns = (previews[0]?.headers ?? this.previewColumns)
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
        this.summary = undefined;
        const statistics = previews.some(preview => preview.statistics)
            ? previews.flatMap(preview => preview.statistics).filter(point => point?.value)
            : [];
        const counts = this.rows.reduce(
            (accumulator, participant) => {
                if (participant.state === BackendImportState.Done) {
                    accumulator.updated++;
                } else if (participant.state === BackendImportState.Referenced) {
                    accumulator.referenced++;
                }

                return accumulator;
            },
            { updated: 0, referenced: 0 }
        );
        const error = statistics.find(item => item.name === 'error');
        const summary = statistics
            .filter(item => item.name !== 'error')
            .map(item => ({
                ...item,
                name: item.name === 'created' ? 'new' : item.name
            }))
            .filter(item => item.name !== 'updated' && item.name !== 'referenced');
        if (counts.updated > 0) {
            summary.push({ name: 'updated', value: counts.updated });
        }
        if (counts.referenced > 0) {
            summary.push({ name: 'referenced', value: counts.referenced });
        }
        if (error) {
            summary.push(error);
        }
        this.summary = summary;
    }

    protected calculateRows(previews: BackendImportPreview[]): ViewImportedParticipant[] {
        return previews?.flatMap(preview =>
            preview.rows.map(row => {
                const participant = new ViewImportedParticipant(row.id, row);
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

        this.cd.detectChanges();
        ref.close();
    }

    protected isReferenced(row: ViewImportedParticipant): boolean {
        if (row.state === BackendImportState.Error) return false;
        if (row.data?.['username']?.['info'] === 'referenced') {
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

    protected checkChanges(
        participant: ViewImportedParticipant,
        headerName?: string
    ): boolean | ['autorenew', Record<string, unknown>] {
        const changes: Record<string, unknown> = {};
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
        if (Object.keys(changes).length > 0) {
            return true;
        } else {
            // unchanged
            return false;
        }
    }

    public onEncodingChange(value: string): void {
        this.importer.encoding = value;
        this.importer.refreshFile();
    }

    public onTextSeparatorChange(value: string): void {
        this.importer.textSeparator = value;
        this.importer.refreshFile();
    }

    public onColumnSeparatorChange(value: string): void {
        this.importer.columnSeparator = value;
        this.importer.refreshFile();
    }
}
