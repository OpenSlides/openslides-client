import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionWorker } from 'src/app/domain/models/action-worker/action-worker';
import { DEFAULT_FIELDSET, Fieldsets, TypedFieldset } from 'src/app/site/services/model-request-builder';

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

    public override getFieldsets(): Fieldsets<ActionWorker> {
        const detailFieldset: TypedFieldset<ActionWorker> = [`name`, `state`, `created`, `timestamp`, `result`];
        return {
            [DEFAULT_FIELDSET]: detailFieldset
        };
    }
}
