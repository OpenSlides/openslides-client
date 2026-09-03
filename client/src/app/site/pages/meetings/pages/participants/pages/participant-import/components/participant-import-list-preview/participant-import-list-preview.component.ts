import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef
} from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { AccountControllerService } from '@app/site/pages/organization/pages/accounts/services/common/account-controller.service';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ImportListHeaderDefinition } from '@app/ui/modules/import-list';
import { BackendImportPhase } from '@app/ui/modules/import-list/components/via-backend-import-list/backend-import-list.component';
import {
    BackendImportEntry,
    BackendImportEntryObject,
    BackendImportHeader,
    BackendImportIdentifiedRow,
    BackendImportPreview,
    BackendImportState,
    BackendImportSummary
} from '@app/ui/modules/import-list/definitions/backend-import-preview';
import { ListModule } from '@app/ui/modules/list';
import { ScrollingTableCellDefConfig } from '@app/ui/modules/scrolling-table/directives/scrolling-table-cell-config';
import { START_POSITION } from '@app/ui/modules/scrolling-table/directives/scrolling-table-cell-position';
import { _, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, Observable, of, Subscription } from 'rxjs';

import { ViewGroup } from '../../../../modules';
import { ViewStructureLevel } from '../../../structure-levels/view-models';
import { ParticipantImportService } from '../../services/participant-import.service/participant-import.service';
import { ParticipantImportFilterService } from '../../services/participant-import-filter.service';
import { CSVEncodingOptionsService } from '../../services/participant-import-preview.service/participant-import-preview-csv-encoding-options.service';
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
        TranslatePipe,
        MatTooltip,
        MatCheckbox,
        NgClass,
        MatDialogModule,
        MatProgressSpinner
    ]
})
export class ParticipantImportListPreviewComponent implements OnInit, OnDestroy {
    public readonly START_POSITION = START_POSITION;

    protected activeMeetingIdService = inject(ActiveMeetingIdService);
    protected accountsControllerService = inject(AccountControllerService);

    private modelName = `Participant`;

    @Input()
    public importer = inject(ParticipantImportService);

    public filterService = inject(ParticipantImportFilterService);
    public searchService = inject(ParticipantImportPreviewSearchService);
    private CSVEncodingOptions = inject(CSVEncodingOptionsService);

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
     * Whether or not to allow horizontal scroll
     */
    public horizontalScroll = true;

    /**
     * Whether or not to show the header
     */
    public showHeader = true;

    private userAccounts = this.accountsControllerService.getViewModelList();

    /** The header's order according to how they are displayed on the template file */
    private headersOrder = [
        'title',
        'first_name',
        'last_name',
        'email',
        'member_number',
        'structure_level',
        'groups',
        'number',
        'vote_weight',
        'gender',
        'pronoun',
        'username',
        'default_password',
        'is_active',
        'is_physical_person',
        'is_present',
        'locked_out',
        'saml_id',
        'home_committee',
        'external',
        'comment'
    ];

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

    private _headers: Record<string, { default?: ImportListHeaderDefinition; preview?: BackendImportHeader }> = {};
    protected uploadButton: boolean;
    private tempPreviewsObservable: Subscription;

    public constructor(
        protected translate: TranslateService,
        private cd: ChangeDetectorRef,
        private dialog: MatDialog
    ) {}

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public ngOnInit(): void {
        /* TODO: REMOVE THE MANUAL STATISTICS' CALCULATION */
        this._dataSource = this.importer.previewsObservable.pipe(map(previews => this.calculateRows(previews)));
        this.importer.currentImportPhaseObservable.subscribe(phase => {
            this._state = phase;
        });
        this.CSVEncodingOptions.toggleCSVOptions = true;
        let previousConfig = this.CSVEncodingOptions?.SelectedConfig$.value;
        this.CSVEncodingOptions?.SelectedConfig$.subscribe(options => {
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
            this.fillPreviewData(previews);
            this.setHeaders({ preview: this._previewColumns });
        });
    }

    /**
     * Resets the importer when leaving the view
     */
    public ngOnDestroy(): void {
        this.CSVEncodingOptions.toggleCSVOptions = false;
        this.tempPreviewsObservable.unsubscribe();
        this.importer.clearPreview();
        this.importer.clearFile();
        this.importer.clearAll();
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
                return `merge`;
            case BackendImportState.Remove:
                return `remove`;
            case BackendImportState.Unchanged:
                return ``;
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
                return 'autorenew';
            case BackendImportState.Generated:
                return `merge`;
            case BackendImportState.Remove:
                return `remove`;
            default:
                // ad hoc check for updated structure levels and groups
                if ((item.info as string) === 'updated') {
                    return 'autorenew';
                }
                return 'mood_bad';
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
                return ``;
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
                referenced: ['merge', 'accent'],
                unchanged: [``, ``]
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
                        ? this.translate.instant(`will be created`) // item will be updated
                        : this.translate.instant(`has been created`)) // item has been created
                );
            case BackendImportState.Done:
                return (
                    this.translate.instant(this.modelName) +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will be updated`) // item will be updated
                        : this.translate.instant(`has been updated`))
                ); // item has been updated
            case BackendImportState.Referenced:
                return (
                    this.translate.instant(this.modelName) +
                    ` ` +
                    (this._state !== BackendImportPhase.FINISHED
                        ? this.translate.instant(`will be referenced`) // item will be referenced
                        : this.translate.instant(`has been referenced`)) // item has been referenced
                );
            case BackendImportState.Unchanged:
                return ``;
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

    public getShortenedDecimal(decimalString: string): string {
        while (decimalString?.length && [`0`, `.`].includes(decimalString?.charAt(decimalString?.length - 1))) {
            decimalString = decimalString?.substring(0, decimalString?.length - 1);
        }
        return decimalString;
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
            const orderMap = new Map(this.headersOrder.map((property, index) => [property, index]));
            this._previewColumns = (previews[0]?.headers ?? this._previewColumns)
                .filter(header => !header.is_hidden)
                .sort((a, b) => {
                    const aIndex = orderMap.get(a.property) ?? this.headersOrder.length;
                    const bIndex = orderMap.get(b.property) ?? this.headersOrder.length;
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
        const countReferenced = this.rows.filter(row => row?.state === BackendImportState.Referenced)?.length | 0;
        const countUnchanged = this.rows.filter(row => row?.state === BackendImportState.Unchanged)?.length | 0;
        const countUpdated =
            (this._summary.find(item => item?.name === 'updated')?.value - countReferenced - countUnchanged) | 0;
        const error = this._summary.find(item => item.name === 'error');
        this._summary = this._summary.filter(item => item.name !== 'updated');
        if (countReferenced > 0) {
            this._summary.push({ name: 'referenced', value: countReferenced });
        }
        if (countUpdated > 0) {
            this._summary.push({ name: 'updated', value: countUpdated });
        }
        this._summary = this._summary.filter(item => item.name !== 'error');
        this._summary.push({ name: error?.name, value: error?.value });
    }

    private calculateRows(previews: BackendImportPreview[]): ViewImportedParticipant[] {
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
        this.tempPreviewsObservable.unsubscribe();
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

    private isReferenced(row: ViewImportedParticipant): boolean {
        if (row.state !== 'done') {
            return false;
        }
        for (const user of this.userAccounts) {
            if (
                (user.meeting_ids.includes(row.meeting_id) && row.username && row.username === user.username) ||
                (row.member_number && row.member_number === user.member_number) ||
                (row.saml_id && row.saml_id === user.saml_id)
            ) {
                return false;
            }
        }
        row.setState = BackendImportState.Referenced;
        return true;
    }

    private isUnchanged(item: ViewImportedParticipant): boolean {
        if (item.state !== BackendImportState.Done) {
            return false;
        }
        if (this.checkChanges(item) === false) {
            item.setState = BackendImportState.Unchanged;
            return true;
        }
        return false;
    }

    protected checkChanges(item: ViewImportedParticipant, headerName?: string): false | string {
        for (const user of this.userAccounts) {
            if (
                (user.meeting_ids.includes(item.meeting_id) && item.username && item.username === user.username) ||
                (item.member_number && item.member_number === user.member_number) ||
                (item.saml_id && item.saml_id === user.saml_id)
            ) {
                const updatedUser = user.getModel();
                const changes: Partial<Record<keyof ViewUser, { old?: unknown; new: unknown | unknown[] }>> = {};
                const changedStructureLevels = this.checkArrayFields(
                    Array.isArray(item.data?.['structure_level']) ? item.data?.['structure_level'] : [],
                    user?.structure_levels(this.activeMeetingIdService.meetingId)
                );
                const userGroups: ViewGroup[] = user?.groups(this.activeMeetingIdService.meetingId) || [];
                const itemGroups = item?.data['groups'] || [];
                const changedGroups = this.checkArrayFields(itemGroups as BackendImportEntry[], userGroups);
                for (const key of Object.keys(updatedUser) as (keyof ViewUser)[]) {
                    if (key in item) {
                        const importedValue = item[key as keyof ViewImportedParticipant];
                        if (key === 'id') {
                            continue;
                        }
                        if (updatedUser[key] !== importedValue) {
                            changes[key] = {
                                old: updatedUser[key],
                                new: importedValue
                            };
                        }
                    }
                    if (item.isLockedOut !== user.is_locked_out && user.is_locked_out !== undefined) {
                        changes['locked_out'] = {
                            old: user.is_locked_out,
                            new: item.isLockedOut
                        };
                    }
                    if (item.isPresent !== user.isPresentInMeeting() && user.isPresentInMeeting() !== undefined) {
                        changes['is_present'] = {
                            old: user.isPresentInMeeting(),
                            new: item.isPresent
                        };
                    }
                    if (item.saml_id !== user.saml_id) {
                        changes['saml_id'] = {
                            old: user.saml_id,
                            new: item.saml_id
                        };
                    }
                    if (item.number !== user.number() && user.number() !== '') {
                        changes['number'] = {
                            old: user.number(),
                            new: item.number
                        };
                    }
                    if (item.comment !== user.comment(this.activeMeetingIdService.meetingId)) {
                        changes['comment'] = {
                            old: user.comment(),
                            new: item.comment
                        };
                    }
                    if (item.gender !== user.gender_name && user.gender_name !== '') {
                        changes['gender'] = {
                            old: user.gender_name,
                            new: item.gender
                        };
                    }
                    if (
                        this.getShortenedDecimal(item.voteWeight) !==
                        this.getShortenedDecimal(user.voteWeight.toString())
                    ) {
                        changes['vote_weight'] = {
                            old: user.voteWeight,
                            new: item.voteWeight
                        };
                    }
                    if (item.isExternal !== user.external && user.external !== undefined) {
                        changes['external'] = {
                            old: user.external,
                            new: item.external
                        };
                    }
                    if (changedGroups.new?.length) {
                        changes['groups'] = {
                            old: changedGroups.old,
                            new: changedGroups.new
                        };
                    }
                    if (changedStructureLevels.new?.length) {
                        changes['structure_level'] = {
                            old: changedStructureLevels.old,
                            new: changedStructureLevels.new
                        };
                    }
                }
                if (Object.keys(changes).includes(headerName)) {
                    return 'autorenew';
                }
                if (Object.keys(changes).length === 0) {
                    return false;
                }
            }
        }
        return '';
    }

    private checkArrayFields(
        addedItems: BackendImportEntry[],
        oldItems: ViewGroup[] | ViewStructureLevel[]
    ): {
        old?: number[];
        new: BackendImportEntry[];
    } {
        const oldItemIds = oldItems.map((oldItem: ViewGroup | ViewStructureLevel) => oldItem.id).sort();
        if (addedItems.every(item => oldItemIds.includes(item['id']))) {
            return { new: null };
        }
        const diffItemNames = addedItems
            .filter(addedItem => !oldItems.includes(addedItem['id']) && addedItem['id'])
            .sort();
        diffItemNames.filter(infoState => {
            if (!oldItemIds.includes(infoState['id'])) infoState['info'] = 'updated';
        });
        return {
            old: oldItemIds,
            new: diffItemNames
        };
    }
}
