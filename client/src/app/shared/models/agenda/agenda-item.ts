import { Fqid, Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';
import { HasProjectionIds } from '../base/has-projectable-ids';
import { HasTagIds } from '../base/has-tag-ids';

export enum AgendaItemType {
    COMMON = `common`,
    INTERNAL = `internal`,
    HIDDEN = `hidden`
}

/**
 * Determine type for agenda items
 */
export const ItemTypeChoices = [
    { key: AgendaItemType.COMMON, name: `public`, csvName: `` },
    { key: AgendaItemType.INTERNAL, name: `internal`, csvName: `internal` },
    { key: AgendaItemType.HIDDEN, name: `hidden`, csvName: `hidden` }
];

/**
 * Representations of agenda Item
 * @ignore
 */
export class AgendaItem extends BaseModel<AgendaItem> {
    public static COLLECTION = `agenda_item`;

    public id: Id;
    public item_number: string;
    public comment: string;
    public closed: boolean;
    public type: AgendaItemType;
    public is_hidden: boolean;
    public is_internal: boolean;
    public duration: number; // in seconds
    public weight: number;
    /**
     * Client-calculated field: The level indicates the indentation of an agenda-item.
     */
    public level: number;
    /**
     * Client-calculated field: The tree_weight indicates the position of an agenda-item in a list of agenda-items.
     */
    public tree_weight: number;

    public content_object_id: Fqid; // */agenda_item_id;
    public parent_id?: Id; // agenda_item/child_ids;
    public child_ids: Id[]; // (agenda_item/parent_id)[];

    public constructor(input?: any) {
        super(AgendaItem.COLLECTION, input);
    }
}
export interface AgendaItem extends HasMeetingId, HasProjectionIds, HasTagIds {}
