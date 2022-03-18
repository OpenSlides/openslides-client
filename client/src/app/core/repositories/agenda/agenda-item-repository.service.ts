import { Injectable } from '@angular/core';
import { AgendaItemAction } from 'app/core/actions/agenda-item-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { TreeIdNode, TreeService } from 'app/core/ui-services/tree.service';
import { AgendaItem, AgendaItemType } from 'app/shared/models/agenda/agenda-item';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { HasAgendaItem, ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { BaseViewModel } from 'app/site/base/base-view-model';

import { ViewMeeting } from '../../../management/models/view-meeting';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

export interface AgendaListTitle {
    title: string;
    subtitle?: string;
}

/**
 * Repository service for items
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: `root`
})
export class AgendaItemRepositoryService
    extends BaseRepositoryWithActiveMeeting<ViewAgendaItem, AgendaItem>
    implements ModelRequestRepository
{
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        private meetingSettingsService: MeetingSettingsService,
        private treeService: TreeService
    ) {
        super(repositoryServiceCollector, AgendaItem);

        this.setSortFunction((a, b) => a.tree_weight - b.tree_weight); // leave the sorting as it is
    }

    public getFieldsets(): Fieldsets<AgendaItem> {
        return {
            [DEFAULT_FIELDSET]: [
                `item_number`,
                `comment`,
                `closed`,
                `type`,
                `is_hidden`,
                `is_internal`,
                `duration`,
                `weight`,
                `level`,
                `parent_id`,
                `child_ids`,
                `meeting_id`
            ]
        };
    }

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Items` : `Item`);

    private getAgendaTitle(viewAgendaItem: ViewAgendaItem): AgendaListTitle {
        if (viewAgendaItem.content_object) {
            return viewAgendaItem.content_object.getAgendaListTitle();
        } else if (viewAgendaItem.child_ids?.length) {
            return { title: `-` };
        }
    }

    public getTitle = (viewAgendaItem: ViewAgendaItem) => this.getAgendaTitle(viewAgendaItem).title;

    public getSubtitle = (viewAgendaItem: ViewAgendaItem) => this.getAgendaTitle(viewAgendaItem).subtitle;

    public getItemNumberPrefix(viewModel: HasAgendaItem): string {
        return viewModel.agenda_item && viewModel.agenda_item.item_number
            ? `${viewModel.agenda_item.item_number} · `
            : ``;
    }

    /**
     * @override The base-function to extends the items with an optional subtitle.
     *
     * @param model The underlying item.
     * @param initialLoading boolean passed to the base-function.
     *
     * @returns {ViewAgendaItem} The modified item extended with the `getSubtitle()`-function.
     */
    protected createViewModel(model: AgendaItem): ViewAgendaItem {
        const viewModel = super.createViewModel(model);
        viewModel.getSubtitle = () => this.getSubtitle(viewModel);
        return viewModel;
    }

    /**
     * Trigger the automatic numbering sequence on the server
     */
    public async autoNumbering(): Promise<void> {
        const payload: AgendaItemAction.NumberingPayload = {
            meeting_id: this.activeMeetingId
        };
        return await this.actions.sendRequest(AgendaItemAction.NUMBERING, payload);
    }

    /**
     * Saves the (full) update to an existing model. So called "update"-function
     * Provides a default procedure, but can be overwritten if required
     *
     * @param update the update that should be created
     * @param viewModel the view model that the update is based on
     */
    public async update(update: Partial<AgendaItem>, viewModel: ViewAgendaItem): Promise<void> {
        const payload: AgendaItemAction.UpdatePayload = {
            id: viewModel.id,
            closed: update.closed,
            comment: update.comment,
            duration: update.duration,
            item_number: update.item_number,
            tag_ids: update.tag_ids,
            type: update.type,
            weight: update.weight
        };
        return await this.actions.sendRequest(AgendaItemAction.UPDATE, payload);
    }

    public async addItemToAgenda(contentObject: BaseViewModel & HasAgendaItem): Promise<Identifiable> {
        const payload: AgendaItemAction.CreatePayload = {
            content_object_id: contentObject.getModel().fqid
        };
        return await this.actions.sendRequest(AgendaItemAction.CREATE, payload);
    }

    public async removeFromAgenda(...items: (Identifiable | Id)[]): Promise<void> {
        let payload: AgendaItemAction.DeletePayload[];
        if (typeof items[0] === `number`) {
            payload = items.map(item => ({ id: item as Id }));
        } else {
            payload = items.map(item => ({ id: (item as Identifiable).id }));
        }
        await this.actions.sendBulkRequest(AgendaItemAction.DELETE, payload);
    }

    /**
     * Sends the changed nodes to the server.
     *
     * @param data The reordered data from the sorting
     */
    public async sortItems(data: TreeIdNode[]): Promise<void> {
        const payload: AgendaItemAction.SortPayload = {
            meeting_id: this.activeMeetingId,
            tree: data
        };
        return await this.actions.sendRequest(AgendaItemAction.SORT, payload);
    }

    /**
     * Calculates the estimated end time based on the configured start and the
     * sum of durations of all agenda items
     *
     * @returns a Date object or null
     */
    public calculateEndTime(): Date {
        const startTime = this.meetingSettingsService.instant(`start_time`); // a timestamp
        const duration = this.calculateDuration();
        if (!startTime || !duration) {
            return null;
        }
        const durationTime = duration * 60 * 1000; // minutes to miliseconds
        return new Date(startTime + durationTime);
    }

    /**
     * get the sum of durations of all agenda items
     *
     * @returns a numerical value representing item durations (currently minutes)
     */
    public calculateDuration(): number {
        let duration = 0;
        this.getViewModelList().forEach(item => {
            if (item.duration) {
                duration += item.duration;
            }
        });
        return duration;
    }

    public bulkOpenItems(items: ViewAgendaItem[]): Promise<void> {
        const payload: AgendaItemAction.UpdatePayload[] = items.map(item => ({ closed: false, id: item.id }));
        return this.sendBulkActionToBackend(AgendaItemAction.UPDATE, payload);
    }

    public bulkCloseItems(items: ViewAgendaItem[]): Promise<void> {
        const payload: AgendaItemAction.UpdatePayload[] = items.map(item => ({ closed: true, id: item.id }));
        return this.sendBulkActionToBackend(AgendaItemAction.UPDATE, payload);
    }

    public bulkSetAgendaType(items: ViewAgendaItem[], agendaType: AgendaItemType): Promise<void> {
        const payload: AgendaItemAction.UpdatePayload[] = items.map(item => ({ id: item.id, type: agendaType }));
        return this.sendBulkActionToBackend(AgendaItemAction.UPDATE, payload);
    }

    public getRequestToGetAllModels(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `agenda_item_ids`,
                    follow: [
                        {
                            idField: `content_object_id`,
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

    protected tapViewModels(viewModels: ViewAgendaItem[]): void {
        this.treeService.injectFlatNodeInformation(viewModels, `weight`, `parent_id`);
    }
}
