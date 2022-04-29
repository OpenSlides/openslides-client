import { HasMeeting } from '../../../../../view-models/has-meeting';
import { PersonalNote } from '../../../../../../../../domain/models/motions/personal-note';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { HasPersonalNote } from './has-personal-note';
import { ViewUser } from '../../../../../view-models/view-user';

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
