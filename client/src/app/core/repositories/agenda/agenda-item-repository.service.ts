import { Injectable } from '@angular/core';

import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { TreeIdNode } from 'app/core/ui-services/tree.service';
import { AgendaItem } from 'app/shared/models/agenda/agenda-item';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { HasAgendaItem, ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
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
    providedIn: 'root'
})
export class AgendaItemRepositoryService extends BaseRepositoryWithActiveMeeting<ViewAgendaItem, AgendaItem> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(repositoryServiceCollector, AgendaItem);

        this.setSortFunction((a, b) => a.weight - b.weight);
    }

    public getFieldsets(): Fieldsets<AgendaItem> {
        return {
            [DEFAULT_FIELDSET]: [
                'item_number',
                'comment',
                'closed',
                'type',
                'is_hidden',
                'is_internal',
                'duration',
                'weight',
                'level',
                'parent_id',
                'child_ids',
                'meeting_id'
            ]
        };
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Items' : 'Item');
    };

    private getAgendaTitle(viewAgendaItem: ViewAgendaItem): AgendaListTitle {
        if (viewAgendaItem.content_object) {
            return viewAgendaItem.content_object.getAgendaListTitle();
        } else {
            return { title: '<missing content object>' };
        }
    }

    public getTitle = (viewAgendaItem: ViewAgendaItem) => {
        return this.getAgendaTitle(viewAgendaItem).title;
    };

    public getSubtitle = (viewAgendaItem: ViewAgendaItem) => {
        return this.getAgendaTitle(viewAgendaItem).subtitle;
    };

    public getItemNumberPrefix(viewModel: HasAgendaItem): string {
        return viewModel.agenda_item && viewModel.agenda_item.item_number
            ? `${viewModel.agenda_item.item_number} · `
            : '';
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
        // await this.httpService.post('/rest/agenda/item/numbering/');
        throw new Error('TODO');
    }

    /**
     * META-TODO: can this be removed?
     * TODO: Copied from BaseRepository and added the cloned model to write back the
     * item_number correctly. This must be reverted with #4738 (indroduced with #4639)
     *
     * Saves the (full) update to an existing model. So called "update"-function
     * Provides a default procedure, but can be overwritten if required
     *
     * @param update the update that should be created
     * @param viewModel the view model that the update is based on
     */
    public async update(update: Partial<AgendaItem>, viewModel: ViewAgendaItem): Promise<void> {
        // (<any>update)._itemNumber = update.item_number;
        // const sendUpdate = viewModel.getUpdatedModelData(update);
        // const clone = JSON.parse(JSON.stringify(sendUpdate));
        // clone.item_number = clone._itemNumber;
        // return await super.update(clone, viewModel);
        throw new Error('TODO');
    }

    public async addItemToAgenda(contentObject: BaseViewModel & HasAgendaItem): Promise<Identifiable> {
        return await this.create({ id: contentObject.id } as AgendaItem);
    }

    public async removeFromAgenda(item: ViewAgendaItem): Promise<void> {
        return await this.delete(item);
    }

    public async create(item: AgendaItem): Promise<Identifiable> {
        throw new Error('Use `addItemToAgenda` for creations');
    }

    public async delete(item: ViewAgendaItem): Promise<void> {
        throw new Error('Use `removeFromAgenda` for deletions');
    }

    /**
     * Sends the changed nodes to the server.
     *
     * @param data The reordered data from the sorting
     */
    public async sortItems(data: TreeIdNode[]): Promise<void> {
        // await this.httpService.post('/rest/agenda/item/sort/', data);
        throw new Error('TODO');
    }

    /**
     * Calculates the estimated end time based on the configured start and the
     * sum of durations of all agenda items
     *
     * @returns a Date object or null
     */
    public calculateEndTime(): Date {
        const startTime = this.meetingSettingsService.instant('start_time'); // a timestamp
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
}
