import { BaseHasMeetingUserViewModel } from 'src/app/site/pages/meetings/base/base-has-meeting-user-view-model';

import { PersonalNote } from '../../../../../../../../domain/models/motions/personal-note';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { HasPersonalNote } from './has-personal-note';

export class ViewPersonalNote extends BaseHasMeetingUserViewModel<PersonalNote> {
    public static COLLECTION = PersonalNote.COLLECTION;

    public get personalNote(): PersonalNote {
        return this._model;
    }
}
interface IPersonalNoteRelations {
    content_object?: BaseViewModel & HasPersonalNote;
}
export interface ViewPersonalNote extends PersonalNote, IPersonalNoteRelations, HasMeeting {}
