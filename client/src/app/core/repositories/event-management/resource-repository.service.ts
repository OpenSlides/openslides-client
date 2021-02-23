import { Injectable } from '@angular/core';

import { Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Resource } from 'app/shared/models/event-management/resource';
import { ViewResource } from 'app/site/event-management/models/view-resource';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class ResourceRepositoryService extends BaseRepository<ViewResource, Resource> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Resource);
    }

    public getTitle = (viewResource: ViewResource) => {
        return viewResource.token;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Resources' : 'Resource');
    };

    public getFieldsets(): Fieldsets<Resource> {
        return {}; // TODO
    }
}
