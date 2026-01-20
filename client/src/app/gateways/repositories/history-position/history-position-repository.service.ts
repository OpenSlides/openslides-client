import { Injectable } from '@angular/core';
import { HistoryPosition } from 'src/app/domain/models/history-position/history-position';

import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { ViewHistoryPosition } from './view-history-position';
@Injectable({
    providedIn: `root`
})
export class HistoryPositionRepositoryService extends BaseRepository<ViewHistoryPosition, HistoryPosition> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollectorService) {
        super(repositoryServiceCollector, HistoryPosition);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `History positions` : `History position`);
    public getTitle = (viewModel: ViewHistoryPosition): string => `Position ${viewModel.id}`;
}
