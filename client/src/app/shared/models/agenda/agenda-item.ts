import { BaseModelWithContentObject } from '../base/base-model-with-content-object';

/**
 * Determine visibility states for agenda items
 * Coming from "ConfigVariables" property "agenda_hide_internal_items_on_projector"
 */
export const ItemVisibilityChoices = [
    { key: 1, name: 'public', csvName: '' },
    { key: 2, name: 'internal', csvName: 'internal' },
    { key: 3, name: 'hidden', csvName: 'hidden' }
];

/**
 * Representations of agenda Item
 * @ignore
 */
export class AgendaItem extends BaseModelWithContentObject<AgendaItem> {
    public static COLLECTION = 'agenda_item';

    public id: number;
    public item_number: string;
    public comment: string;
    public closed: boolean;
    public type: number;
    public is_hidden: boolean;
    public is_internal: boolean;
    public duration: number; // in seconds
    public weight: number;
    public level: number;

    public content_object_id: string; // */agenda_item_id;
    public parent_id: number; // agenda_item/child_ids;
    public child_ids: number[]; // (agenda_item/parent_id)[];
    public projection_ids: number[]; // (projection/element_id)[];
    public current_projector_ids: number[]; // (projector/current_element_ids)[]
    public meeting_id: number; // meeting/agenda_item_ids;

    public constructor(input?: any) {
        super(AgendaItem.COLLECTION, input);
    }
}
