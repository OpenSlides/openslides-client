import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { AgendaItem, AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { TreeIdNode } from 'src/app/infrastructure/definitions/tree';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { AgendaListTitle, HasAgendaItem, ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';
import { TreeService } from 'src/app/ui/modules/sorting/modules/sorting-tree/services';

import { Action } from '../../actions';
import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { AgendaItemAction } from './agenda-item.action';

@Injectable({
    providedIn: `root`
})
export class AgendaItemRepositoryService extends BaseMeetingRelatedRepository<ViewAgendaItem, AgendaItem> {
    public constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        private treeService: TreeService
    ) {
        super(repositoryServiceCollector, AgendaItem);

        this.setSortFunction((a, b) => a.tree_weight - b.tree_weight); // leave the sorting as it is
    }

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Items` : `Item`);

    private getAgendaTitle(viewAgendaItem: ViewAgendaItem): AgendaListTitle {
        if (viewAgendaItem.content_object) {
            return viewAgendaItem.content_object?.getAgendaListTitle();
        } else if (viewAgendaItem.child_ids?.length) {
            return { title: `-` };
        }
        return { title: `-` }; // Default: Clarify which is the default
    }

    public getTitle = (viewAgendaItem: ViewAgendaItem) => this.getAgendaTitle(viewAgendaItem).title;

    public getSubtitle = (viewAgendaItem: ViewAgendaItem) => this.getAgendaTitle(viewAgendaItem).subtitle;

    public getItemNumberPrefix(viewModel: HasAgendaItem): string {
        return viewModel.agenda_item && viewModel.agenda_item.item_number
            ? `${viewModel.agenda_item.item_number} · `
            : ``;
    }

    /**
     * Trigger the automatic numbering sequence on the server
     */
    public async autoNumbering(): Promise<void> {
        const payload = { meeting_id: this.activeMeetingId };
        await this.actions.sendRequest(AgendaItemAction.NUMBERING, payload);
    }

    /**
     * Saves the (full) update to an existing model. So called "update"-function
     * Provides a default procedure, but can be overwritten if required
     *
     * @param update the update that should be created
     * @param viewModel the view model that the update is based on
     */
    public async update(update: Partial<AgendaItem>, viewModel: ViewAgendaItem): Promise<void> {
        const payload: any = {
            id: viewModel.id,
            ...this.getOptionalPayload(update)
        };
        await this.actions.sendRequest(AgendaItemAction.UPDATE, payload);
    }

    public assignToParents(content: any, meetingId: Id = this.activeMeetingId!): Action<void> {
        const payload = {
            meeting_id: meetingId,
            parent_id: content.parent_id,
            ids: content.ids
        };
        return this.createAction(AgendaItemAction.ASSIGN, [payload]);
    }

    public addToAgenda(data: any, ...contentObjects: (BaseViewModel & HasAgendaItem)[]): Action<Identifiable[]> {
        const payload = contentObjects.map(contentObject => ({
            content_object_id: contentObject.getModel()?.fqid || contentObject.fqid,
            ...this.getOptionalPayload(data)
        }));
        return this.createAction(AgendaItemAction.CREATE, payload);
    }

    public async removeFromAgenda(...items: (Identifiable | Id)[]): Promise<void> {
        let payload: any[];
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
        const payload = { meeting_id: this.activeMeetingId, tree: data };
        await this.actions.sendRequest(AgendaItemAction.SORT, payload);
    }

    public bulkOpenItems(items: ViewAgendaItem[]): Promise<void> {
        const payload: any[] = items.map(item => ({ closed: false, id: item.id }));
        return this.sendBulkActionToBackend(AgendaItemAction.UPDATE, payload);
    }

    public bulkCloseItems(items: ViewAgendaItem[]): Promise<void> {
        const payload: any[] = items.map(item => ({ closed: true, id: item.id }));
        return this.sendBulkActionToBackend(AgendaItemAction.UPDATE, payload);
    }

    public bulkSetAgendaType(items: ViewAgendaItem[], agendaType: AgendaItemType): Promise<void> {
        const payload: any[] = items.map(item => ({ id: item.id, type: agendaType }));
        return this.sendBulkActionToBackend(AgendaItemAction.UPDATE, payload);
    }

    /**
     * @override The base-function to extends the items with an optional subtitle.
     *
     * @returns {ViewAgendaItem} The modified item extended with the `getSubtitle()`-function.
     */
    protected override createViewModel(model: AgendaItem): ViewAgendaItem {
        const viewModel = super.createViewModel(model);
        viewModel.getSubtitle = () => this.getSubtitle(viewModel) as string;
        return viewModel;
    }

    protected override tapViewModels(viewModels: ViewAgendaItem[]): void {
        this.treeService.injectFlatNodeInformation(viewModels, `weight`, `parent_id`);
    }

    private getOptionalPayload(content: any): any {
        return {
            item_number: content.item_number,
            parent_id: content.parent_id,
            comment: content.comment,
            closed: content.closed,
            type: content.type,
            duration: content.duration,
            weight: content.weight,
            tag_ids: content.tag_ids
        };
    }
}
