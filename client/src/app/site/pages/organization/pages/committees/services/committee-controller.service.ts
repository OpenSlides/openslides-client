import { Injectable } from '@angular/core';
import { Action } from 'src/app/gateways/actions';
import { BackendImportRawPreview } from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

import { Ids } from '../../../../../../domain/definitions/key-types';
import { Identifiable } from '../../../../../../domain/interfaces';
import { Committee } from '../../../../../../domain/models/comittees/committee';
import { CommitteeRepositoryService } from '../../../../../../gateways/repositories/committee-repository.service';
import { BaseController } from '../../../../../base/base-controller';
import { ControllerServiceCollectorService } from '../../../../../services/controller-service-collector.service';
import { ViewCommittee } from '../view-models';
import { CommitteeCommonServiceModule } from './committee-common-service.module';

@Injectable({
    providedIn: CommitteeCommonServiceModule
})
export class CommitteeControllerService extends BaseController<ViewCommittee, Committee> {
    public constructor(
        repositoryServiceCollector: ControllerServiceCollectorService,
        protected override repo: CommitteeRepositoryService
    ) {
        super(repositoryServiceCollector, Committee, repo);
    }

    public bulkForwardToCommittees(committees: ViewCommittee[], committeeIds: Ids): Promise<void> {
        return this.repo.bulkForwardToCommittees(committees, committeeIds);
    }

    public bulkUnforwardToCommittees(committees: ViewCommittee[], committeeIds: Ids): Promise<void> {
        return this.repo.bulkUnforwardToCommittees(committees, committeeIds);
    }

    public create(...committees: any[]): Promise<Identifiable[]> {
        return this.repo.create(...committees);
    }

    public update(update?: any, ...committees: ViewCommittee[]): Action<void> {
        return this.repo.update(update, ...committees);
    }

    public delete(...committees: ViewCommittee[]): Promise<void> {
        return this.repo.delete(...committees);
    }

    public jsonUpload(payload: { [key: string]: any }): Action<BackendImportRawPreview> {
        return this.repo.committeeJsonUpload(payload);
    }

    public import(payload: { id: number; import: boolean }[]): Action<BackendImportRawPreview | void> {
        return this.repo.committeeImport(payload);
    }
}
