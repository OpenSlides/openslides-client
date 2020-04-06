import { PersonalNote } from 'app/shared/models/users/personal-note';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from './view-user';

export type PersonalNoteTitleInformation = object;

export interface HasPersonalNote {
    personal_notes?: ViewPersonalNote[];
    personal_note_ids: number[];
    getPersonalNote: () => ViewPersonalNote | null;
}

export class ViewPersonalNote extends BaseViewModel<PersonalNote> implements PersonalNoteTitleInformation {
    public static COLLECTION = PersonalNote.COLLECTION;

    public get personalNote(): PersonalNote {
        return this._model;
    }
}
interface IPersonalNoteRelations {
    user: ViewUser;
    content_object?: BaseViewModel & HasPersonalNote;
}
export interface ViewPersonalNote extends PersonalNote, IPersonalNoteRelations {}
