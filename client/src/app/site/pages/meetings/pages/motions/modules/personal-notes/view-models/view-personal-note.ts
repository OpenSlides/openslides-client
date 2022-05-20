import { PersonalNote } from '../../../../../../../../domain/models/motions/personal-note';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewUser } from '../../../../../view-models/view-user';
import { HasPersonalNote } from './has-personal-note';

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
