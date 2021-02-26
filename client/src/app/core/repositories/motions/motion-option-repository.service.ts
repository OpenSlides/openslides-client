import { Injectable } from '@angular/core';

import { Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { MotionOption } from 'app/shared/models/motions/motion-option';
import { ViewMotionOption } from 'app/site/motions/models/view-motion-option';
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
export class MotionOptionRepositoryService extends BaseRepositoryWithActiveMeeting<ViewMotionOption, MotionOption> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionOption);
    }

    public getTitle = (viewMotionOption: ViewMotionOption) => {
        return 'Option';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Options' : 'Option');
    };

    public getFieldsets(): Fieldsets<MotionOption> {
        return {}; // TODO
    }
}
