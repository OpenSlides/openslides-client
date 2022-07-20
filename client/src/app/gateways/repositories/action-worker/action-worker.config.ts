import { ActionWorker } from 'src/app/domain/models/action-worker/action-worker';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

import { ActionWorkerRepositoryService } from './action-worker-repository.service';
import { ViewActionWorker } from './view-action-worker';

export const ActionWorkerAppConfig: AppConfig = {
    name: `action-worker`,
    models: [
        {
            model: ActionWorker,
            viewModel: ViewActionWorker,
            repository: ActionWorkerRepositoryService
        }
    ]
};
