import { HasMeetingId } from 'app/core/actions/common/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace TopicAction {
    interface PartialPayload {
        // optional
        title?: string;
        text?: UnsafeHtml;
        attachment_ids?: Id[];
        tag_ids?: Id[];
    }

    export interface CreatePayload extends PartialPayload, HasMeetingId {
        // required
        title: string;

        // Non-model fields for customizing the agenda item creation, optional
        agenda_type?: number;
        agenda_parent_id?: number;
        agenda_comment?: string;
        agenda_duration?: number;
        agenda_weight?: number;
    }

    export interface UpdatePayload extends Identifiable, PartialPayload {}
}
