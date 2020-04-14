import { Id } from 'app/core/definitions/key-types';

export interface HasPersonalNoteIds {
    personal_note_ids: Id[]; // (personal_note/content_object_id)[];
}
