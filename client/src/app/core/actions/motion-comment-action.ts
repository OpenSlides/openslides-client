import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace MotionCommentAction {
    export interface CreatePayload {
        comment: UnsafeHtml;
        motion_id: Id;
        section_id: Id;
    }
    export interface UpdatePayload extends Identifiable {
        comment?: UnsafeHtml;
    }
}
