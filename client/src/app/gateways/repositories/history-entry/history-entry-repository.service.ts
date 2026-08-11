import { Service } from '@angular/core';
import { HistoryEntry } from '@app/domain/models/history-entry/history-entry';

import { BaseRepository } from '../base-repository';
import { ViewHistoryEntry } from './view-history-entry';

@Service()
export class HistoryEntryRepositoryService extends BaseRepository<ViewHistoryEntry, HistoryEntry> {
    public constructor() {
        super(HistoryEntry);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `History entries` : `History entry`);
    public getTitle = (viewModel: ViewHistoryEntry): string => `Entry ${viewModel.id}`;
}
