import { Injectable } from '@angular/core';

import { Role } from 'app/shared/models/event-management/role';
import { ViewRole } from 'app/site/event-management/models/view-role';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class RoleRepositoryService extends BaseRepository<ViewRole, Role> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Role);
    }

    public getTitle = (viewRole: ViewRole) => {
        return viewRole.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Roles' : 'Role');
    };
}
