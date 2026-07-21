import { inject, Service } from '@angular/core';
import { HistoryPosition } from '@app/domain/models/history-position/history-position';

import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { ViewHistoryPosition } from './view-history-position';

@Service()
export class HistoryPositionRepositoryService extends BaseRepository<ViewHistoryPosition, HistoryPosition> {
    public constructor() {
        const repositoryServiceCollector = inject(RepositoryServiceCollectorService);
        super(repositoryServiceCollector, HistoryPosition);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `History positions` : `History position`);
    public getTitle = (viewModel: ViewHistoryPosition): string => `Position ${viewModel.id}`;
}
