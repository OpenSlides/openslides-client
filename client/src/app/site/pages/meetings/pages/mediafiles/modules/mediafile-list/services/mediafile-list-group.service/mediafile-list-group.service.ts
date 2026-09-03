import { inject, Service } from '@angular/core';
import { GroupRepositoryService } from '@app/gateways/repositories/groups';
import { Observable } from 'rxjs';

import { ViewGroup } from '../../../../../participants/modules/groups/view-models/view-group';

@Service()
export class MediafileListGroupService {
    private groupRepo = inject(GroupRepositoryService);

    public getViewModelListObservable(): Observable<ViewGroup[]> {
        return this.groupRepo.getViewModelListObservable();
    }
}
