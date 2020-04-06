import { Fqid } from 'app/core/definitions/key-types';
import { AgendaItem, ItemVisibilityChoices } from 'app/shared/models/agenda/agenda-item';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseViewModelWithAgendaItem } from 'app/site/base/base-view-model-with-agenda-item';
import { Projectable, ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewProjection } from 'app/site/projector/models/view-projection';
import { ViewProjector } from 'app/site/projector/models/view-projector';

export interface AgendaItemTitleInformation {
    content_object?: BaseViewModelWithAgendaItem;
    content_object_id: Fqid;
}

export class ViewAgendaItem extends BaseViewModel<AgendaItem> implements AgendaItemTitleInformation, Projectable {
    public static COLLECTION = AgendaItem.COLLECTION;
    protected _collection = AgendaItem.COLLECTION;

    public get item(): AgendaItem {
        return this._model;
    }

    public getSubtitle: () => string | null;

    /**
     * Gets the string representation of the item type
     * @returns The visibility for this item, as defined in {@link itemVisibilityChoices}
     */
    public get verboseType(): string {
        if (!this.type) {
            return '';
        }
        const type = ItemVisibilityChoices.find(choice => choice.key === this.type);
        return type ? type.name : '';
    }

    public getProjectorTitle(): string {
        return this.getTitle();
    }

    public getSlide(): ProjectorElementBuildDeskriptor {
        throw new Error('TODO');
    }

    /**
     * Gets a shortened string for CSV export
     * @returns empty string if it is a public item, 'internal' or 'hidden' otherwise
     */
    public get verboseCsvType(): string {
        if (!this.type) {
            return '';
        }
        const type = ItemVisibilityChoices.find(choice => choice.key === this.type);
        return type ? type.csvName : '';
    }
}
interface IAgendaItemRelations {
    content_object?: BaseViewModelWithAgendaItem;
    parent?: ViewAgendaItem;
    children: ViewAgendaItem[];
    projections: ViewProjection[];
    current_projectors: ViewProjector[];
    meeting?: ViewMeeting;
}
export interface ViewAgendaItem extends AgendaItem, IAgendaItemRelations {}
