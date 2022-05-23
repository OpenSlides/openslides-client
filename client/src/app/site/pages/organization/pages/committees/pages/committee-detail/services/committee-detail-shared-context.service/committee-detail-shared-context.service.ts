import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CommitteeDetailServiceModule } from '../committee-detail-service.module';

@Injectable({
    providedIn: CommitteeDetailServiceModule
})
export class CommitteeDetailSharedContextService {
    public readonly currentCommitteeId = new BehaviorSubject<number | null>(null);

    public constructor() {
        console.log(`create constructor`);
    }
}
