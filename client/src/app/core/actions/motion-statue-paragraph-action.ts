import { HasMeetingId } from 'app/core/actions/common/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace MotionStatuteParagraphAction {
    export interface CreatePayload extends HasMeetingId {
        title: string;
        text: UnsafeHtml;
    }
    export interface UpdatePayload extends Identifiable {
        title?: string;
        text?: UnsafeHtml;
    }
    export interface SortPayload extends HasMeetingId {
        statute_paragraph_ids: Id[];
    }
}
