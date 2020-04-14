import { AgendaListTitle } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { AgendaItem, ItemVisibilityChoices } from 'app/shared/models/agenda/agenda-item';
import { HasAgendaItemId } from 'app/shared/models/base/has-agenda-item-id';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { DetailNavigable } from 'app/site/base/detail-navigable';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';

export interface HasAgendaItem extends DetailNavigable, HasAgendaItemId {
    agenda_item?: ViewAgendaItem;

    /**
     * @returns the agenda title
     */
    getAgendaSlideTitle: () => string;

    /**
     * @return the agenda title with the verbose name of the content object
     */
    getAgendaListTitle: () => AgendaListTitle;

    /**
     * @returns the (optional) descriptive text to be exported in the CSV.
     * May be overridden by inheriting classes
     */
    getCSVExportText: () => string;
}

export class ViewAgendaItem extends BaseProjectableViewModel<AgendaItem> {
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

    public getProjectorTitle = () => {
        const subtitle = this.item.comment || null;
        return { title: this.getTitle(), subtitle };
    };

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
    content_object?: BaseViewModel & HasAgendaItem;
    parent?: ViewAgendaItem;
    children: ViewAgendaItem[];
    meeting?: ViewMeeting;
}
export interface ViewAgendaItem extends AgendaItem, IAgendaItemRelations {}
