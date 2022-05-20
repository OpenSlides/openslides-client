import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupRepositoryService } from 'src/app/gateways/repositories/groups';

import { ViewGroup } from '../../../../../participants';
import { MediafileListServiceModule } from '../mediafile-list-service.module';

@Injectable({ providedIn: MediafileListServiceModule })
export class MediafileListGroupService {
    public constructor(private groupRepo: GroupRepositoryService) {}

    public getViewModelListObservable(): Observable<ViewGroup[]> {
        return this.groupRepo.getViewModelListObservable();
    }
}
