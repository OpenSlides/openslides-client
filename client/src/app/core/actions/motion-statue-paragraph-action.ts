import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';

import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace MotionStatuteParagraphAction {
    export const CREATE = `motion_statute_paragraph.create`;
    export const UPDATE = `motion_statute_paragraph.update`;
    export const DELETE = `motion_statute_paragraph.delete`;
    export const SORT = `motion_statute_paragraph.sort`;

    export interface CreatePayload extends HasMeetingId {
        title: string;
        text: UnsafeHtml;
    }
    export interface UpdatePayload extends Identifiable {
        title?: string;
        text?: UnsafeHtml;
    }
    export interface DeletePayload extends Identifiable {}
    export interface SortPayload extends HasMeetingId {
        statute_paragraph_ids: Id[];
    }
}
