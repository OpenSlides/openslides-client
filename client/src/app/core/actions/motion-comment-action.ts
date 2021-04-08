import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace MotionCommentAction {
    export const CREATE = 'motion_comment.create';
    export const UPDATE = 'motion_comment.update';
    export const DELETE = 'motion_comment.delete';

    export interface CreatePayload {
        comment: UnsafeHtml;
        motion_id: Id;
        section_id: Id;
    }
    export interface UpdatePayload extends Identifiable {
        comment?: UnsafeHtml;
    }

    export interface DeletePayload extends Identifiable {}
}
