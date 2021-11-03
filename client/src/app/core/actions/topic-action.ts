import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';

import { Id, UnsafeHtml } from '../definitions/key-types';
import { AgendaItemCreationPayload } from './common/agenda-item-creation-payload';

export namespace TopicAction {
    export const CREATE = `topic.create`;
    export const UPDATE = `topic.update`;
    export const DELETE = `topic.delete`;

    interface PartialPayload {
        // optional
        title?: string;
        text?: UnsafeHtml;
        attachment_ids?: Id[];
        tag_ids?: Id[];
    }

    export interface CreatePayload extends PartialPayload, HasMeetingId, AgendaItemCreationPayload {
        // required
        title: string;
    }

    export interface UpdatePayload extends Identifiable, PartialPayload {}

    export interface DeletePayload extends Identifiable {}
}
