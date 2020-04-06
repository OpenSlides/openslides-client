import { Fqid, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

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
export class AgendaItem extends BaseModel<AgendaItem> {
    public static COLLECTION = 'agenda_item';

    public id: Id;
    public item_number: string;
    public comment: string;
    public closed: boolean;
    public type: number;
    public is_hidden: boolean;
    public is_internal: boolean;
    public duration: number; // in seconds
    public weight: number;
    public level: number;

    public content_object_id: Fqid; // */agenda_item_id;
    public parent_id?: Id; // agenda_item/child_ids;
    public child_ids: Id[]; // (agenda_item/parent_id)[];
    public projection_ids: Id[]; // (projection/element_id)[];
    public current_projector_ids: Id[]; // (projector/current_element_ids)[]
    public meeting_id: Id; // meeting/agenda_item_ids;

    public constructor(input?: any) {
        super(AgendaItem.COLLECTION, input);
    }
}
