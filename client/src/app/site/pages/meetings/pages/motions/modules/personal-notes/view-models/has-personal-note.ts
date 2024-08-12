import { HasPersonalNoteIds } from 'src/app/domain/interfaces';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { ViewPersonalNote } from './view-personal-note';

export type HasPersonalNote = HasPersonalNoteIds &
    ViewModelRelations<{
        personal_notes?: ViewPersonalNote[];
    }> & {
        getPersonalNote: () => ViewPersonalNote | null;
    };
