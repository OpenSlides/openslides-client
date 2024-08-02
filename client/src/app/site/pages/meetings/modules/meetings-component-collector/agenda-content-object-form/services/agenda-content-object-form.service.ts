import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AgendaItemRepositoryService } from 'src/app/gateways/repositories/agenda';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';

import { ViewAgendaItem } from '../../../../pages/agenda';

@Injectable()
export class AgendaContentObjectFormService {
    public constructor(
        private repo: AgendaItemRepositoryService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {}

    public getViewModelListObservable(): Observable<ViewAgendaItem[]> {
        return this.repo.getViewModelListObservable();
    }
}
