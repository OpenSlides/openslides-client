import { Injectable } from '@angular/core';

import { Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { AssignmentOption } from 'app/shared/models/assignments/assignment-option';
import { ViewAssignmentOption } from 'app/site/assignments/models/view-assignment-option';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Options.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentOptionRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewAssignmentOption,
    AssignmentOption
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, AssignmentOption);
    }

    public getTitle = (viewAssignmentOption: ViewAssignmentOption) => {
        return 'Option';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Options' : 'Option');
    };

    public getFieldsets(): Fieldsets<AssignmentOption> {
        return {}; // TODO
    }
}
