import { Injectable } from '@angular/core';

import { Committee } from 'app/shared/models/event-management/committee';
import { ViewCommittee } from 'app/site/event-management/models/view-committee';
import { BaseRepository } from '../base-repository';
import { MeetingModelBaseRepository } from '../meeting-model-base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class CommitteeRepositoryService extends BaseRepository<ViewCommittee, Committee> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Committee);
    }

    public getTitle = (viewCommittee: ViewCommittee) => {
        return viewCommittee.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Committees' : 'Committee');
    };
}
