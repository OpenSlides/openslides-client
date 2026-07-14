import { Injectable } from '@angular/core';
import { GroupRepositoryService } from '@app/gateways/repositories/groups';
import { Observable } from 'rxjs';

import { ViewGroup } from '../../../../../participants';

@Injectable({ providedIn: 'root' })
export class MediafileListGroupService {
    public constructor(private groupRepo: GroupRepositoryService) {}

    public getViewModelListObservable(): Observable<ViewGroup[]> {
        return this.groupRepo.getViewModelListObservable();
    }
}
