import { Injectable } from '@angular/core';

import { Ids } from '../../../../../../domain/definitions/key-types';
import { Identifiable } from '../../../../../../domain/interfaces';
import { Committee } from '../../../../../../domain/models/comittees/committee';
import { CommitteeRepositoryService } from '../../../../../../gateways/repositories/committee-repository.service';
import { BaseController } from '../../../../../base/base-controller';
import { ViewCommittee } from '../view-models';
import { CommitteeCommonServiceModule } from './committee-common-service.module';

@Injectable({
    providedIn: CommitteeCommonServiceModule
})
export class CommitteeControllerService extends BaseController<ViewCommittee, Committee> {
    public constructor(protected override repo: CommitteeRepositoryService) {
        super(Committee, repo);
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

    public update(update?: any, ...committees: ViewCommittee[]): Promise<void> {
        return this.repo.update(update, ...committees);
    }

    public delete(...committees: ViewCommittee[]): Promise<void> {
        return this.repo.delete(...committees);
    }
}
