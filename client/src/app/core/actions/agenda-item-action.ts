import { AgendaItemType } from 'app/shared/models/agenda/agenda-item';
import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';

import { Fqid, Id } from '../definitions/key-types';
import { BaseSortPayload } from './common/base-sort-payload';

export namespace AgendaItemAction {
    export const CREATE = `agenda_item.create`;
    export const UPDATE = `agenda_item.update`;
    export const DELETE = `agenda_item.delete`;
    export const SORT = `agenda_item.sort`;
    export const NUMBERING = `agenda_item.numbering`;
    export const ASSIGN = `agenda_item.assign`;

    interface OptionalPayload {
        item_number?: string;
        comment?: string;
        closed?: boolean;
        type?: AgendaItemType;
        duration?: number; // in seconds
        weight?: number;
        tag_ids?: Id[];
    }

    export interface CreatePayload extends OptionalPayload {
        // Required
        content_object_id: Fqid;

        // Optional
        parent_id?: Id;
    }

    export interface UpdatePayload extends Identifiable, OptionalPayload {}
    export interface DeletePayload extends Identifiable {}

    export interface AssignPayload extends HasMeetingId {
        ids: Id[];
        parent_id: Id;
    }
    export interface SortPayload extends HasMeetingId, BaseSortPayload {}
    export interface NumberingPayload extends HasMeetingId {}
}
