import { inject, Service } from '@angular/core';
import { HistoryEntry } from '@app/domain/models/history-entry/history-entry';

import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { ViewHistoryEntry } from './view-history-entry';

@Service()
export class HistoryEntryRepositoryService extends BaseRepository<ViewHistoryEntry, HistoryEntry> {
    public constructor() {
        const repositoryServiceCollector = inject(RepositoryServiceCollectorService);
        super(repositoryServiceCollector, HistoryEntry);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `History entries` : `History entry`);
    public getTitle = (viewModel: ViewHistoryEntry): string => `Entry ${viewModel.id}`;
}
