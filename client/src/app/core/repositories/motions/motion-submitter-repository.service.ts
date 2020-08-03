import { Injectable } from '@angular/core';

import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { MotionSubmitter } from 'app/shared/models/motions/motion-submitter';
import { ViewMotionSubmitter } from 'app/site/motions/models/view-motion-submitter';
import { MeetingModelBaseRepository } from '../meeting-model-base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class MotionSubmitterRepositoryService extends MeetingModelBaseRepository<ViewMotionSubmitter, MotionSubmitter> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionSubmitter);
    }

    public getFieldsets(): Fieldsets<MotionSubmitter> {
        const listFields: (keyof MotionSubmitter)[] = ['user_id'];

        return {
            [DEFAULT_FIELDSET]: listFields
        };
    }

    public getTitle = (finnWasHere: ViewMotionSubmitter) => {
        return 'Submitter';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Submitters' : 'Submitter');
    };
}
