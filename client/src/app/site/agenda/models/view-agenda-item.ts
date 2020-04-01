import { AgendaItem, ItemVisibilityChoices } from 'app/shared/models/agenda/agenda-item';
import { ContentObject } from 'app/shared/models/base/content-object';
import { BaseViewModelWithAgendaItem } from 'app/site/base/base-view-model-with-agenda-item';
import { BaseViewModelWithContentObject } from 'app/site/base/base-view-model-with-content-object';

export interface AgendaItemTitleInformation {
    contentObject: BaseViewModelWithAgendaItem;
    contentObjectData: ContentObject;
    title_information: object;
}

export class ViewAgendaItem extends BaseViewModelWithContentObject<AgendaItem, BaseViewModelWithAgendaItem>
    implements AgendaItemTitleInformation {
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

    /**
     * Returns the collection of the underlying content-object.
     *
     * @returns The collection as string.
     */
    public get collection(): string {
        return this.contentObjectData.collection;
    }
}
export interface ViewAgendaItem extends AgendaItem {}
