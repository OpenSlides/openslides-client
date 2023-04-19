import { Injectable } from '@angular/core';
import { ActionWorker } from 'src/app/domain/models/action-worker/action-worker';

import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { ViewActionWorker } from './view-action-worker';

@Injectable({
    providedIn: `root`
})
export class ActionWorkerRepositoryService extends BaseRepository<ViewActionWorker, ActionWorker> {
    constructor(repositoryServiceCollector: RepositoryServiceCollectorService) {
        super(repositoryServiceCollector, ActionWorker);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `Action workers` : `Action worker`);
    public getTitle = (viewModel: ViewActionWorker): string => viewModel.name;
}
