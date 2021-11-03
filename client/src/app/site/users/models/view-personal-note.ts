import { HasMeeting } from 'app/management/models/view-meeting';
import { HasPersonalNoteIds } from 'app/shared/models/base/has-personal-note-ids';
import { PersonalNote } from 'app/shared/models/users/personal-note';
import { BaseViewModel } from 'app/site/base/base-view-model';

import { ViewUser } from './view-user';

export interface HasPersonalNote extends HasPersonalNoteIds {
    personal_notes?: ViewPersonalNote[];
    getPersonalNote: () => ViewPersonalNote | null;
}

export class ViewPersonalNote extends BaseViewModel<PersonalNote> {
    public static COLLECTION = PersonalNote.COLLECTION;

    public get personalNote(): PersonalNote {
        return this._model;
    }
}
interface IPersonalNoteRelations {
    user: ViewUser;
    content_object?: BaseViewModel & HasPersonalNote;
}
export interface ViewPersonalNote extends PersonalNote, IPersonalNoteRelations, HasMeeting {}
