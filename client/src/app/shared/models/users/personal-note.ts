import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Representation of users personal note.
 * @ignore
 */
export class PersonalNote extends BaseModel<PersonalNote> {
    public static COLLECTION = 'personal_note';

    public id: Id;
    public note: string;
    public star: boolean;

    public user_id: Id; // user/personal_note_$<meeting_id>_ids;
    public content_object_id: Id; // */personal_note_ids;

    public constructor(input: Partial<PersonalNote>) {
        super(PersonalNote.COLLECTION, input);
    }
}
