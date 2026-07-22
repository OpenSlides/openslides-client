import { inject, Service } from '@angular/core';
import { AgendaItemRepositoryService } from '@app/gateways/repositories/agenda';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { Observable } from 'rxjs';

import { ViewAgendaItem } from '../../../../pages/agenda';

@Service()
export class AgendaContentObjectFormService {
    private repo = inject(AgendaItemRepositoryService);
    private activeMeetingIdService = inject(ActiveMeetingIdService);

    public getViewModelListObservable(): Observable<ViewAgendaItem[]> {
        return this.repo.getViewModelListObservable();
    }
}
