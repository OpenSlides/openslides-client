import { Injectable } from '@angular/core';

import { HttpService } from 'app/core/core-services/http.service';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { TreeIdNode } from 'app/core/ui-services/tree.service';
import { AgendaItem } from 'app/shared/models/agenda/agenda-item';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { AgendaItemTitleInformation, ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { BaseViewModelWithAgendaItem, AgendaListTitle } from 'app/site/base/base-view-model-with-agenda-item';
import { BaseHasContentObjectRepository } from '../base-has-content-object-repository';
import { BaseIsAgendaItemContentObjectRepository } from '../base-is-agenda-item-content-object-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository service for items
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class AgendaItemRepositoryService extends BaseHasContentObjectRepository<
    ViewAgendaItem,
    AgendaItem,
    BaseViewModelWithAgendaItem,
    AgendaItemTitleInformation
> {
    /**
     * Contructor for agenda repository.
     *
     * @param DS The DataStore
     * @param httpService OpenSlides own HttpService
     * @param mapperService OpenSlides mapping service for collection strings
     * @param config Read config variables
     * @param dataSend send models to the server
     * @param treeService sort the data according to weight and parents
     */
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        private httpService: HttpService,
        private config: OrganisationSettingsService
    ) {
        super(repositoryServiceCollector, AgendaItem);

        this.setSortFunction((a, b) => a.weight - b.weight);
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Items' : 'Item');
    };

    private getAgendaTitle(titleInformation: AgendaItemTitleInformation): AgendaListTitle {
        if (titleInformation.contentObject) {
            return titleInformation.contentObject.getAgendaListTitle();
        } else {
            const repo = this.collectionMapperService.getRepository(
                titleInformation.contentObjectData.collection
            ) as BaseIsAgendaItemContentObjectRepository<any, any, any>;
            return repo.getAgendaListTitle(titleInformation.title_information);
        }
    }

    public getTitle = (titleInformation: AgendaItemTitleInformation) => {
        return this.getAgendaTitle(titleInformation).title;
    };

    public getSubtitle = (titleInformation: AgendaItemTitleInformation) => {
        return this.getAgendaTitle(titleInformation).subtitle;
    };

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
        await this.httpService.post('/rest/agenda/item/numbering/');
    }

    /**
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
        (<any>update)._itemNumber = update.item_number;
        const sendUpdate = viewModel.getUpdatedModelData(update);
        const clone = JSON.parse(JSON.stringify(sendUpdate));
        clone.item_number = clone._itemNumber;
        return await this.dataSend.updateModel(clone);
    }

    public async addItemToAgenda(contentObject: BaseViewModelWithAgendaItem<any>): Promise<Identifiable> {
        return await this.httpService.post('/rest/agenda/item/', {
            collection: contentObject.collection,
            id: contentObject.id
        });
    }

    public async removeFromAgenda(item: ViewAgendaItem): Promise<void> {
        return await this.httpService.delete(`/rest/agenda/item/${item.id}/`);
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
        await this.httpService.post('/rest/agenda/item/sort/', data);
    }

    /**
     * Calculates the estimated end time based on the configured start and the
     * sum of durations of all agenda items
     *
     * @returns a Date object or null
     */
    public calculateEndTime(): Date {
        const startTime = this.config.instant<number>('agenda_start_event_date_time'); // a timestamp
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
