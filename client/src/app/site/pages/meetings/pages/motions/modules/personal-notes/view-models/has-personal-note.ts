import { HasPersonalNoteIds } from 'src/app/domain/interfaces';
import { ViewPersonalNote } from './view-personal-note';

export interface HasPersonalNote extends HasPersonalNoteIds {
    personal_notes?: ViewPersonalNote[];
    getPersonalNote: () => ViewPersonalNote | null;
}
