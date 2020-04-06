import { Injectable } from '@angular/core';

import { Organisation } from 'app/shared/models/event-management/organisation';
import { OrganisationTitleInformation, ViewOrganisation } from 'app/site/event-management/models/view-organisation';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class OrganisationRepositoryService extends BaseRepository<
    ViewOrganisation,
    Organisation,
    OrganisationTitleInformation
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Organisation);
    }

    public getTitle = (titleInformation: Organisation) => {
        return titleInformation.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Organisations' : 'Organisation');
    };
}
