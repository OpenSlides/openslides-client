import { Injectable } from '@angular/core';

import { Resource } from 'app/shared/models/event-management/resource';
import { ResourceTitleInformation, ViewResource } from 'app/site/event-management/models/view-resource';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class ResourceRepositoryService extends BaseRepository<ViewResource, Resource, ResourceTitleInformation> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Resource);
    }

    public getTitle = (titleInformation: Resource) => {
        return titleInformation.token;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Resources' : 'Resource');
    };
}
