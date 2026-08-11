import { Service } from '@angular/core';
import { ActionWorker } from '@app/domain/models/action-worker/action-worker';

import { BaseRepository } from '../base-repository';
import { ViewActionWorker } from './view-action-worker';

@Service()
export class ActionWorkerRepositoryService extends BaseRepository<ViewActionWorker, ActionWorker> {
    public baseModelCtor = ActionWorker;

    public getVerboseName = (plural?: boolean): string => (plural ? `Action workers` : `Action worker`);
    public getTitle = (viewModel: ViewActionWorker): string => viewModel.name;
}
