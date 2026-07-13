import { Injectable } from '@angular/core';
import { AgendaItemRepositoryService } from '@app/gateways/repositories/agenda';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { Observable } from 'rxjs';

import { ViewAgendaItem } from '../../../../pages/agenda';

@Injectable({ providedIn: 'root' })
export class AgendaContentObjectFormService {
    public constructor(
        private repo: AgendaItemRepositoryService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {}

    public getViewModelListObservable(): Observable<ViewAgendaItem[]> {
        return this.repo.getViewModelListObservable();
    }
}
