import { Identifiable } from 'app/shared/models/base/identifiable';
import { Fqid, UnsafeHtml } from '../definitions/key-types';

export namespace PersonalNoteAction {
    export const CREATE = 'personal_note.create';
    export const UPDATE = 'personal_note.update';
    export const DELETE = 'personal_note.delete';

    interface BasePayload {
        star?: boolean;
        note?: UnsafeHtml;
    }

    /**
     * At least `star` or `note` has to be given!
     */
    export interface CreatePayload extends BasePayload {
        // required
        content_object_id: Fqid;
    }

    export interface UpdatePayload extends Identifiable, BasePayload {}

    export interface DeletePayload extends Identifiable {}
}
