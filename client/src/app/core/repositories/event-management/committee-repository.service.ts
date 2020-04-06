import { Injectable } from '@angular/core';

import { Committee } from 'app/shared/models/event-management/committee';
import { CommitteeTitleInformation, ViewCommittee } from 'app/site/event-management/models/view-committee';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class CommitteeRepositoryService extends BaseRepository<ViewCommittee, Committee, CommitteeTitleInformation> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Committee);
    }

    public getTitle = (titleInformation: Committee) => {
        return titleInformation.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Committees' : 'Committee');
    };
}
