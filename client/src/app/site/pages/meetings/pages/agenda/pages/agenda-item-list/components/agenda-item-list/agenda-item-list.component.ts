import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { Projectiondefault } from 'src/app/domain/models/projector/projection-default';
import { MeetingProjectionType } from 'src/app/gateways/repositories/meeting-repository.service';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { hasListOfSpeakers, ViewTopic } from 'src/app/site/pages/meetings/pages/agenda';
import { ListOfSpeakersControllerService } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/services/list-of-speakers-controller.service';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda/view-models';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models/projection-build-descriptor';
import { DurationService } from 'src/app/site/services/duration.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { ColumnRestriction } from 'src/app/ui/modules/list';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { TreeService } from 'src/app/ui/modules/sorting/modules/sorting-tree/services';

import { ViewTag } from '../../../../../motions';
import { TagControllerService } from '../../../../../motions/modules/tags/services';
import { TopicControllerService } from '../../../../modules/topics/services/topic-controller.service/topic-controller.service';
import { AgendaItemControllerService } from '../../../../services';
import { AgendaItemExportService } from '../../services/agenda-item-export.service/agenda-item-export.service';
import { AgendaItemFilterService } from '../../services/agenda-item-filter.service/agenda-item-filter.service';
import { AgendaItemMultiselectService } from '../../services/agenda-item-multiselect.service/agenda-item-multiselect.service';
import { AgendaItemInfoDialogComponent } from '../agenda-item-info-dialog/agenda-item-info-dialog.component';

const AGENDA_ITEM_LIST_STORAGE_INDEX = `agenda_item_list`;

@Component({
    selector: `os-agenda-item-list`,
    templateUrl: `./agenda-item-list.component.html`,
    styleUrls: [`./agenda-item-list.component.scss`]
})
export class AgendaItemListComponent extends BaseMeetingListViewComponent<ViewAgendaItem> implements OnInit {
    public readonly AGENDA_TYPE_PUBLIC = AgendaItemType.COMMON;
    public readonly AGENDA_TYPE_INTERNAL = AgendaItemType.INTERNAL;
    public readonly AGENDA_TYPE_HIDDEN = AgendaItemType.HIDDEN;

    public get agendaItemsObservable(): Observable<ViewAgendaItem[]> {
        return this.repo
            .getViewModelListObservable()
            .pipe(map(agendaItems => this.treeService.makeFlatTree(agendaItems, `weight`, `parent_id`)));
    }

    /**
     * Show or hide the numbering button
     */
    public isNumberingAllowed: boolean = false;

    public showSubtitles: Observable<boolean> = this.meetingSettingsService.get(`agenda_show_subtitles`);

    /**
     * The list of all tags.
     */
    public tags: ViewTag[] = [];

    /**
     * Helper to check main button permissions
     *
     * @returns true if the operator can manage agenda items
     */
    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.agendaItemCanManage);
    }

    public itemListSlide: ProjectionBuildDescriptor | null = null;

    public restrictedColumns: ColumnRestriction<Permission>[] = [
        {
            columnName: `menu`,
            permission: Permission.agendaItemCanManage
        }
    ];

    /**
     * Define extra filter properties
     */
    public filterProps = [`item_number`, `comment`, `getListTitle`];

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private operator: OperatorService,
        private route: ActivatedRoute,
        public repo: AgendaItemControllerService,
        private promptService: PromptService,
        private dialog: MatDialog,
        public vp: ViewPortService,
        public durationService: DurationService,
        private agendaItemExportService: AgendaItemExportService,
        public filterService: AgendaItemFilterService,
        private topicRepo: TopicControllerService,
        private meetingRepo: MeetingControllerService,
        private listOfSpeakersRepo: ListOfSpeakersControllerService,
        private treeService: TreeService,
        private tagRepo: TagControllerService,
        private agendaItemMultiselectService: AgendaItemMultiselectService
    ) {
        super(componentServiceCollector, translate);
        this.canMultiSelect = true;
        this.listStorageIndex = AGENDA_ITEM_LIST_STORAGE_INDEX;
    }

    /**
     * Init function.
     * Sets the title, initializes the table and filter options, subscribes to filter service.
     */
    public ngOnInit(): void {
        super.setTitle(`Agenda`);

        this.subscriptions.push(
            this.meetingSettingsService
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
            }),
            this.tagRepo.getViewModelListObservable().subscribe(tags => (this.tags = tags))
        );
    }

    /**
     * Links to the content object.
     *
     * @param item the item that was selected from the list view
     */
    public getDetailUrl(item: ViewAgendaItem): string {
        if (item.content_object && !this.isMultiSelect) {
            return `/${item.content_object.getDetailStateUrl()}`;
        }
        return ``;
    }

    public getSpeakerButtonObject = (agendaItem: ViewAgendaItem): any => {
        if (hasListOfSpeakers(agendaItem.content_object)) {
            return agendaItem.content_object;
        }
        return null;
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
        this.router.navigate([`topics`, `new`], { relativeTo: this.route.parent });
    }

    /**
     * Remove handler for a single item
     *
     * @param item The item to remove from the agenda
     */
    public async removeFromAgenda(item: ViewAgendaItem): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to remove this entry from the agenda?`);
        const content = item.content_object!.getTitle();
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
            const contentObjects: BaseViewModel[] = this.selectedRows.map(
                item => item.content_object
            ) as BaseViewModel[];
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
     * Opens a dialog to add or remove tags to the given tags
     */
    public async changeSelectedTags(): Promise<void> {
        this.agendaItemMultiselectService.changeTags(this.selectedRows);
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
        this.agendaItemExportService.exportAsCsv(this.listComponent.source);
    }

    /**
     * Triggers the export of the agenda. Currently filtered items and 'hidden'
     * items will not be exported
     */
    public onDownloadPdf(): void {
        this.agendaItemExportService.exportAsPdf(this.listComponent.source);
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
            this.meetingRepo.deleteAllSpeakersOfAllListsOfSpeakersIn(this.activeMeetingId!);
        }
    }

    /**
     * Duplicates a single selected item.
     *
     * @param topicAgendaItem The item to duplicte.
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
     * @param obj The selected item.
     *
     * @returns `true` if the given item's collection is equal to the `Topic.COLLECTION`.
     */
    public isTopic(obj: any): obj is ViewTopic {
        const topic = obj as ViewTopic;
        return !!topic && topic.collection !== undefined && topic.collection === ViewTopic.COLLECTION && !!topic.topic;
    }
}
