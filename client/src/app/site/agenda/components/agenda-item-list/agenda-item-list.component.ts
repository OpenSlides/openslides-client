import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { PdfDocumentService } from 'app/core/pdf-services/pdf-document.service';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import {
    MeetingProjectionType,
    MeetingRepositoryService
} from 'app/core/repositories/management/meeting-repository.service';
import { SUBMITTER_FOLLOW } from 'app/core/repositories/motions/motion-repository.service';
import { TopicRepositoryService } from 'app/core/repositories/topics/topic-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ColumnRestriction } from 'app/shared/components/list-view-table/list-view-table.component';
import { SPEAKER_BUTTON_FOLLOW } from 'app/shared/components/speaker-button/speaker-button.component';
import { AgendaItemType } from 'app/shared/models/agenda/agenda-item';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { ViewTopic } from 'app/site/topics/models/view-topic';
import { Observable } from 'rxjs';

import { ViewAgendaItem } from '../../models/view-agenda-item';
import { hasListOfSpeakers } from '../../models/view-list-of-speakers';
import { AgendaCsvExportService } from '../../services/agenda-csv-export.service';
import { AgendaFilterListService } from '../../services/agenda-filter-list.service';
import { AgendaPdfService } from '../../services/agenda-pdf.service';
import { AgendaItemInfoDialogComponent } from '../agenda-item-info-dialog/agenda-item-info-dialog.component';

/**
 * List view for the agenda.
 */
@Component({
    selector: `os-agenda-item-list`,
    templateUrl: `./agenda-item-list.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: [`./agenda-item-list.component.scss`]
})
export class AgendaItemListComponent extends BaseListViewComponent<ViewAgendaItem> implements OnInit {
    public readonly AGENDA_TYPE_PUBLIC = AgendaItemType.COMMON;
    public readonly AGENDA_TYPE_INTERNAL = AgendaItemType.INTERNAL;
    public readonly AGENDA_TYPE_HIDDEN = AgendaItemType.HIDDEN;

    /**
     * Show or hide the numbering button
     */
    public isNumberingAllowed: boolean;

    public showSubtitles: Observable<boolean> = this.meetingsSettingsService.get(`agenda_show_subtitles`);

    /**
     * Helper to check main button permissions
     *
     * @returns true if the operator can manage agenda items
     */
    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.agendaItemCanManage);
    }

    public itemListSlide: ProjectionBuildDescriptor | null = null;

    /**
     * Define the columns to show
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `title`,
            width: `100%`
        },
        {
            prop: `info`,
            minWidth: 120
        }
    ];

    public restrictedColumns: ColumnRestriction[] = [
        {
            columnName: `menu`,
            permission: Permission.agendaItemCanManage
        }
    ];

    /**
     * Define extra filter properties
     */
    public filterProps = [`item_number`, `comment`, `getListTitle`];

    /**
     * The usual constructor for components
     * @param titleService Setting the browser tab title
     * @param translate translations
     * @param matSnackBar Shows errors and messages
     * @param operator The current user
     * @param router Angulars router
     * @param repo the agenda repository,
     * @param promptService the delete prompt
     * @param dialog to change info values
     * @param config read out config values
     * @param vp determine the viewport
     * @param durationService Converts numbers to readable duration strings
     * @param csvExport Handles the exporting into csv
     * @param filterService: service for filtering data
     * @param agendaPdfService: service for preparing a pdf of the agenda
     * @param pdfService: Service for exporting a pdf
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private operator: OperatorService,
        private router: Router,
        private route: ActivatedRoute,
        public repo: AgendaItemRepositoryService,
        private promptService: PromptService,
        private dialog: MatDialog,
        private meetingsSettingsService: MeetingSettingsService,
        public vp: ViewportService,
        public durationService: DurationService,
        private csvExport: AgendaCsvExportService,
        public filterService: AgendaFilterListService,
        private agendaPdfService: AgendaPdfService,
        private pdfService: PdfDocumentService,
        private topicRepo: TopicRepositoryService,
        private meetingRepo: MeetingRepositoryService,
        private listOfSpeakersRepo: ListOfSpeakersRepositoryService
    ) {
        super(componentServiceCollector, translate);
        this.canMultiSelect = true;
    }

    /**
     * Init function.
     * Sets the title, initializes the table and filter options, subscribes to filter service.
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle(`Agenda`);

        this.subscriptions.push(
            this.meetingsSettingsService
                .get(`agenda_enable_numbering`)
                .subscribe(autoNumbering => (this.isNumberingAllowed = autoNumbering)),
            this.activeMeetingIdService.meetingIdObservable.subscribe(id => {
                if (id) {
                    this.itemListSlide = {
                        content_object_id: `meeting/${id}`,
                        type: MeetingProjectionType.AgendaItemList,
                        slideOptions: [
                            {
                                key: `only_main_items`,
                                displayName: _(`Only main agenda items`),
                                default: false
                            }
                        ],
                        projectionDefault: Projectiondefault.agendaAllItems,
                        getDialogTitle: () => this.translate.instant(`Agenda`)
                    };
                } else {
                    this.itemListSlide = null;
                }
            })
        );
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `agenda_item_ids`,
                    follow: [
                        {
                            idField: `content_object_id`,
                            follow: [SPEAKER_BUTTON_FOLLOW, SUBMITTER_FOLLOW],
                            fieldset: `title`,

                            // To enable the reverse relation from content_object->agenda_item.
                            // Needed for getItemNumberPrefix
                            additionalFields: [`agenda_item_id`]
                        }
                    ]
                }
            ],
            fieldset: []
        };
    }

    /**
     * Links to the content object.
     *
     * @param item the item that was selected from the list view
     */
    public getDetailUrl(item: ViewAgendaItem): string {
        if (item.content_object && !this.isMultiSelect) {
            return `/${item.content_object.getDetailStateURL()}`;
        }
    }

    public getSpeakerButtonObject = (agendaItem: ViewAgendaItem) => {
        if (hasListOfSpeakers(agendaItem.content_object)) {
            return agendaItem.content_object;
        }
    };

    /**
     * Opens the item-info-dialog.
     * Enable direct changing of various information
     *
     * @param item The view item that was clicked
     */
    public openEditInfo(item: ViewAgendaItem): void {
        if (this.isMultiSelect || !this.canManage) {
            return;
        }
        const dialogRef = this.dialog.open(AgendaItemInfoDialogComponent, { ...infoDialogSettings, data: item });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.durationText) {
                    result.duration = this.durationService.stringToDuration(result.durationText);
                } else {
                    result.duration = 0;
                }
                this.repo.update(result, item);
            }
        });
    }

    /**
     * Click handler for the numbering button to enable auto numbering
     */
    public async onAutoNumbering(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to number all agenda items?`);
        if (await this.promptService.open(title)) {
            await this.repo.autoNumbering();
        }
    }

    /**
     * Click handler for the done button in the dot-menu
     */
    public async onDoneSingleButton(item: ViewAgendaItem): Promise<void> {
        await this.repo.update({ closed: !item.closed }, item);
    }

    /**
     * Handler for the plus button.
     * Comes from the HeadBar Component
     */
    public onPlusButton(): void {
        this.router.navigate([`../topics/new`], { relativeTo: this.route.parent });
    }

    /**
     * Remove handler for a single item
     *
     * @param item The item to remove from the agenda
     */
    public async removeFromAgenda(item: ViewAgendaItem): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to remove this entry from the agenda?`);
        const content = item.content_object.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.removeFromAgenda(item);
        }
    }

    public async deleteTopic(item: ViewAgendaItem): Promise<void> {
        if (!(item.content_object instanceof ViewTopic)) {
            return;
        }
        const title = this.translate.instant(`Are you sure you want to delete this topic?`);
        const content = item.content_object.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.topicRepo.delete(item.content_object);
        }
    }

    /**
     * Handler for deleting multiple entries. Needs items in selectedRows, which
     * is only filled with any data in multiSelect mode
     */
    public async removeSelected(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to remove all selected items from the agenda?`);
        const content = this.translate.instant(`All topics will be deleted and won't be accessible afterwards.`);
        if (await this.promptService.open(title, content)) {
            try {
                await this.repo.removeFromAgenda(...this.selectedRows);
            } catch (e) {
                this.raiseError(e);
            }
        }
    }

    /**
     * Sets multiple entries' open state. Needs items in selectedRows, which
     * is only filled with any data in multiSelect mode
     */
    public async openSelectedItems(): Promise<void> {
        try {
            await this.repo.bulkOpenItems(this.selectedRows);
        } catch (e) {
            this.raiseError(e);
        }
    }

    public async setLosClosed(closed: boolean): Promise<void> {
        try {
            const contentObjects: BaseViewModel[] = this.selectedRows.map(item => item.content_object);
            return await this.listOfSpeakersRepo.setClosed(closed, ...contentObjects);
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Sets multiple entries' open state. Needs items in selectedRows, which
     * is only filled with any data in multiSelect mode
     */
    public async closeSelectedItems(): Promise<void> {
        try {
            await this.repo.bulkCloseItems(this.selectedRows);
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Sets multiple entries' agenda type. Needs items in selectedRows, which
     * is only filled with any data in multiSelect mode.
     */
    public async setAgendaType(agendaType: AgendaItemType): Promise<void> {
        try {
            await this.repo.bulkSetAgendaType(this.selectedRows, agendaType);
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Export all items as CSV
     */
    public csvExportItemList(): void {
        this.csvExport.exportItemList(this.dataSource.filteredData);
    }

    /**
     * Triggers the export of the agenda. Currently filtered items and 'hidden'
     * items will not be exported
     */
    public onDownloadPdf(): void {
        const filename = this.translate.instant(`Agenda`);
        this.pdfService.download(this.agendaPdfService.agendaListToDocDef(this.dataSource.filteredData), filename);
    }

    /**
     * Get the calculated end date and time
     *
     * @returns a readable string with end date and time in the current languages' convention
     */
    public getDurationEndString(): string {
        const duration = this.repo.calculateDuration();
        if (!duration) {
            return ``;
        }
        const durationString = this.durationService.durationToString(duration, `h`);
        const endTime = this.repo.calculateEndTime();
        const result = `${this.translate.instant(`Duration`)}: ${durationString}`;
        if (endTime) {
            return (
                result +
                ` (${this.translate.instant(`Estimated end`)}:
            ${endTime.toLocaleTimeString(this.translate.currentLang, { hour: `numeric`, minute: `numeric` })} h)`
            );
        } else {
            return result;
        }
    }

    public async deleteAllSpeakersOfAllListsOfSpeakers(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to clear all speakers of all lists?`);
        const content = this.translate.instant(`All lists of speakers will be cleared.`);
        if (await this.promptService.open(title, content)) {
            this.meetingRepo.deleteAllSpeakersOfAllListsOfSpeakersInAMeeting(this.activeMeetingId);
        }
    }

    /**
     * Duplicates a single selected item.
     *
     * @param item The item to duplicte.
     */
    public duplicateTopic(topicAgendaItem: ViewAgendaItem): void {
        this.topicRepo.duplicateTopics(topicAgendaItem);
    }

    /**
     * Duplicates all selected items, that are topics.
     *
     * @param selectedItems All selected items.
     */
    public duplicateMultipleTopics(selectedItems: ViewAgendaItem[]): void {
        this.topicRepo.duplicateTopics(...selectedItems.filter(item => this.isTopic(item.content_object)));
    }

    /**
     * Helper function to determine, if the given item is a `Topic`.
     *
     * @param item The selected item.
     *
     * @returns `true` if the given item's collection is equal to the `Topic.COLLECTION`.
     */
    public isTopic(obj: any): obj is ViewTopic {
        const topic = obj as ViewTopic;
        return !!topic && topic.collection !== undefined && topic.collection === ViewTopic.COLLECTION && !!topic.topic;
    }
}
