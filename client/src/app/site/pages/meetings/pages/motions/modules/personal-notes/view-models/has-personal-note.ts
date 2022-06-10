import { Observable } from 'rxjs';
import { HasPersonalNoteIds } from 'src/app/domain/interfaces';

import { ViewPersonalNote } from './view-personal-note';

export interface HasPersonalNote extends HasPersonalNoteIds {
    personal_notes?: ViewPersonalNote[];
    personal_notes_as_observable: Observable<ViewPersonalNote[]>;
    getPersonalNote: () => ViewPersonalNote | null;
}
