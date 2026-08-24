import { HasPersonalNoteIds } from '@app/domain/interfaces';
import { ViewModelRelations } from '@app/site/base/base-view-model';

import { ViewPersonalNote } from './view-personal-note';

export type HasPersonalNote = HasPersonalNoteIds &
    ViewModelRelations<{
        personal_notes?: ViewPersonalNote[];
    }> & {
        getPersonalNote: () => ViewPersonalNote | null;
    };
