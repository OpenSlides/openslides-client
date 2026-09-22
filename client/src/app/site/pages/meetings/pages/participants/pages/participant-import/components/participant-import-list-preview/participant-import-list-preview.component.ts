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
import { MatDialogModule } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { toDecimal } from '@app/infrastructure/utils';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { AccountControllerService } from '@app/site/pages/organization/pages/accounts/services/common/account-controller.service';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { BackendImportPhase } from '@app/ui/modules/import-list/components/via-backend-import-list/backend-import-list.component';
import {
    BackendImportEntry,
    BackendImportEntryObject,
    BackendImportPreview,
    BackendImportState,
    BackendImportSummary
} from '@app/ui/modules/import-list/definitions/backend-import-preview';
import { ImportListPreview } from '@app/ui/modules/import-list/import-list-preview';
import { ListModule } from '@app/ui/modules/list';
import { ScrollingTableCellDefConfig } from '@app/ui/modules/scrolling-table/directives/scrolling-table-cell-config';
import { START_POSITION } from '@app/ui/modules/scrolling-table/directives/scrolling-table-cell-position';
import { _, TranslatePipe } from '@ngx-translate/core';
import { map, Observable, Subscription } from 'rxjs';

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
        MatProgressSpinner,
        MatLabel
    ]
})
export class ParticipantImportListPreviewComponent extends ImportListPreview implements OnInit, OnDestroy {
    public readonly START_POSITION = START_POSITION;

    protected activeMeetingIdService = inject(ActiveMeetingIdService);
    private accountsControllerService = inject(AccountControllerService);
    private userAccounts = this.accountsControllerService.getViewModelList();

    public modelName = `Participant`;

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

    protected importDone: boolean;
    private tempPreviewsObservable: Subscription;

    public constructor(private cd: ChangeDetectorRef) {
        super();
    }

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public override ngOnInit(): void {
        this._dataSource = this.importer.previewsObservable.pipe(map(previews => this.calculateRows(previews)));
        this.importer.currentImportPhaseObservable.subscribe(phase => {
            this._state = phase;
            this.importDone = [BackendImportPhase.FINISHED, BackendImportPhase.FINISHED_WITH_WARNING].includes(phase);
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
        this.importDone = undefined;
        this.tempPreviewsObservable.unsubscribe();
        this.importer.clearPreview();
        this.importer.clearFile();
        this.importer.clearAll();
    }

    /**
     * Gets the style of the column for the given property.
     */
    protected override getColumnConfig(propertyName: string): ScrollingTableCellDefConfig {
        const defaultHeader = this._headers[propertyName]?.default;
        const headerConfig = this.headersConfig.find(config => config.header === propertyName);
        const colWidth = defaultHeader?.width ?? (headerConfig ? headerConfig.size : 150);
        const def: ScrollingTableCellDefConfig = { minWidth: Math.max(150, colWidth) };
        if (!defaultHeader?.flexible) {
            def.width = colWidth;
        }
        return def;
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

    protected override getEntryIcon(item: BackendImportEntryObject): string {
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
    protected override getRowTooltip(row: ViewImportedParticipant): string {
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

    protected override fillPreviewData(previews: BackendImportPreview[]): void {
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
        addIfMissing(['updated', counts[0]], ['referenced', counts[1]]);
        this._summary.map(item => {
            if (item.name === 'created') {
                item.name = 'new';
            }
            if (counts[0] > 0 && item.name === 'updated') {
                item.value = counts[0];
            }
            if (counts[1] > 0 && item.name === 'referenced') {
                item.value = counts[1];
            }
        });
        this._summary = this._summary.filter(item => item.name !== 'error');
        this._summary.push({ name: error?.name, value: error?.value });
    }

    protected override calculateRows(previews: BackendImportPreview[]): ViewImportedParticipant[] {
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

    protected checkChanges(
        item: ViewImportedParticipant,
        headerName?: string
    ): boolean | (string | Partial<Record<keyof ViewUser, { old?: unknown; new: unknown }>>)[] {
        for (const user of this.userAccounts) {
            if (
                (user.meeting_ids.includes(item.meeting_id) && item.username && item.username === user.username) ||
                (item.member_number && item.member_number === user.member_number) ||
                (item.saml_id && item.saml_id === user.saml_id)
            ) {
                const updatedUser = user.getModel();
                const changes: Partial<
                    Record<keyof ViewUser, { old?: unknown; new: unknown | unknown[]; removed?: boolean }>
                > = {};
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
                                new: importedValue,
                                removed: ![null, undefined].includes(updatedUser[key]) && importedValue === undefined
                            };
                        }
                    }
                    if (
                        item.home_committee !== user.home_committee?.getModel()?.name &&
                        !(item.home_committee === null && user.home_committee?.getModel()?.name === undefined)
                    ) {
                        changes['home_committee'] = {
                            old: user.home_committee?.getModel()?.name,
                            new: item.home_committee,
                            removed: this.homeCommitteeRemovalCheck(item, user)
                        };
                    }
                    if (item.isLockedOut !== user.is_locked_out && user.is_locked_out !== undefined) {
                        changes['locked_out'] = {
                            old: user.is_locked_out,
                            new: item.isLockedOut,
                            removed: ![null, undefined].includes(user.is_locked_out) && item.isLockedOut === undefined
                        };
                    }
                    if (item.isPresent !== user.isPresentInMeeting() && user.isPresentInMeeting() !== undefined) {
                        changes['is_present'] = {
                            old: user.isPresentInMeeting(),
                            new: item.isPresent,
                            removed:
                                ![null, undefined].includes(user.isPresentInMeeting()) && item.isPresent === undefined
                        };
                    }
                    if (item.saml_id !== user.saml_id) {
                        changes['saml_id'] = {
                            old: user.saml_id,
                            new: item.saml_id,
                            removed: ![null, undefined].includes(user.saml_id) && item.saml_id === undefined
                        };
                    }
                    if (item.number !== user.number() && user.number() !== '') {
                        changes['number'] = {
                            old: user.number(),
                            new: item.number,
                            removed: ![null, undefined].includes(user.number()) && item.number === undefined
                        };
                    }
                    if (
                        item.comment !== user.comment(this.activeMeetingIdService.meetingId) &&
                        user.comment(this.activeMeetingIdService.meetingId) &&
                        !(item.comment === undefined)
                    ) {
                        changes['comment'] = {
                            old: user.comment(),
                            new: item.comment,
                            removed: ![null, undefined].includes(user.comment()) && item.comment === undefined
                        };
                    }
                    if (item.gender !== user.gender_name && user.gender_name !== '') {
                        changes['gender'] = {
                            old: user.gender_name,
                            new: item.gender,
                            removed: ![null, undefined].includes(user.gender_name) && item.gender === undefined
                        };
                    }
                    if (this.voteWeightChanged(item, user)) {
                        changes['vote_weight'] = {
                            old: user.voteWeight,
                            new: item.voteWeight,
                            removed: ![null, undefined].includes(user.voteWeight) && item.voteWeight === undefined
                        };
                    }
                    if (item.isExternal !== user.external && user.external !== undefined) {
                        changes['external'] = {
                            old: user.external,
                            new: item.external,
                            removed: ![null, undefined].includes(user.external) && item.external === undefined
                        };
                    }
                    if (changedGroups?.new !== changedGroups?.old) {
                        changes['groups'] = {
                            old: changedGroups.old,
                            new: changedGroups.new,
                            removed: changedGroups.removed
                        };
                    }
                    if (changedStructureLevels?.new !== changedStructureLevels?.old) {
                        changes['structure_level'] = {
                            old: changedStructureLevels.old,
                            new: changedStructureLevels.new,
                            removed: changedStructureLevels.removed
                        };
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
                if (item.state === 'referenced' && Object.keys(changes).length > 0) {
                    return true;
                }
            }
        }
        // new user
        return ['', {}];
    }

    private checkArrayFields(
        addedItems: BackendImportEntry[],
        oldItems: ViewGroup[] | ViewStructureLevel[]
    ): {
        old?: number[];
        new: BackendImportEntry[];
        removed?: boolean;
    } {
        const oldItemIds = oldItems.map((oldItem: ViewGroup | ViewStructureLevel) => oldItem.id).sort();
        if (addedItems.every(item => oldItemIds.includes(item['id'])) && addedItems.length === oldItemIds.length) {
            return { new: undefined };
        }
        const diffItemNames = addedItems
            .filter(
                addedItem =>
                    addedItem['info'] === 'new' ||
                    oldItemIds.includes(addedItem['id']) ||
                    addedItem['info'] === 'done' ||
                    addedItem['info'] === 'updated'
            )
            .sort();
        diffItemNames.forEach(item => {
            if (item['id'] && !oldItemIds.includes(item['id'])) {
                item['info'] = 'updated';
            }
        });
        return {
            old: oldItemIds,
            new: diffItemNames,
            removed: this.removedArrayItem(oldItemIds, diffItemNames)
        };
    }

    protected removedArrayItem(oldItemIds: number[], diffItemNames: BackendImportEntry[]): boolean {
        return oldItemIds.every(
            id =>
                !diffItemNames
                    .map(item => item['id'])
                    .filter((id): id is number => id !== undefined)
                    .includes(id)
        );
    }

    private voteWeightChanged(item: ViewImportedParticipant, user: ViewUser): boolean {
        console.log(
            item.username,
            item.voteWeight,
            this.getShortenedDecimal(item.voteWeight),
            user.username,
            user.voteWeight,
            this.getShortenedDecimal(user.voteWeight.toString()),
            this.getShortenedDecimal(item.voteWeight) !== this.getShortenedDecimal(user.voteWeight.toString())
        );
        if ('vote_weight' in item === false) {
            return false;
        }
        if (item.voteWeight === undefined && user.voteWeight !== undefined) {
            item.vote_weight = toDecimal(1);
        }
        return this.getShortenedDecimal(item.voteWeight) !== this.getShortenedDecimal(user.voteWeight.toString());
    }

    private homeCommitteeRemovalCheck(item: ViewImportedParticipant, user: ViewUser): boolean {
        if (!(item.home_committee === null && user.home_committee?.getModel()?.name)) {
            return true;
        }
        return false;
    }
}
