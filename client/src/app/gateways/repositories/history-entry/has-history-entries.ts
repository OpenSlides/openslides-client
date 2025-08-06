import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { ViewHistoryEntry } from './view-history-entry';

export type HasHistoryEntries = ViewModelRelations<{
    history_entries: ViewHistoryEntry[];
}>;
