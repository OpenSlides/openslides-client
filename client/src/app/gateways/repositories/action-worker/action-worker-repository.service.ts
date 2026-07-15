import { inject, Service } from '@angular/core';
import { ActionWorker } from '@app/domain/models/action-worker/action-worker';

import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { ViewActionWorker } from './view-action-worker';

@Service()
export class ActionWorkerRepositoryService extends BaseRepository<ViewActionWorker, ActionWorker> {
    public constructor() {
        const repositoryServiceCollector = inject(RepositoryServiceCollectorService);
        super(repositoryServiceCollector, ActionWorker);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `Action workers` : `Action worker`);
    public getTitle = (viewModel: ViewActionWorker): string => viewModel.name;
}
