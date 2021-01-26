import { Fqid, Id, UnsafeHtml } from '../definitions/key-types';

export namespace PersonalNoteAction {
    export const CREATE = 'personal_note.create';
    export const UPDATE = 'personal_note.update';
    export const DELETE = 'personal_note.delete';

    export interface CreatePayload {
        content_object_id: Fqid;

        // At least one of these has to be given:
        star?: boolean;
        note?: UnsafeHtml;
    }

    export interface UpdatePayload {
        id: Id;

        star?: boolean;
        note?: UnsafeHtml;
    }

    export interface DeletePayload {
        id: Id;
    }
}
