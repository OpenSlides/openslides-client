import { Injectable } from '@angular/core';

import { MotionSubmitter } from 'app/shared/models/motions/motion-submitter';
import { ViewMotionSubmitter } from 'app/site/motions/models/view-motion-submitter';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class MotionSubmitterRepositoryService extends BaseRepository<ViewMotionSubmitter, MotionSubmitter> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionSubmitter);
    }

    public getTitle = (finnWasHere: ViewMotionSubmitter) => {
        return 'Submitter';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Submitters' : 'Submitter');
    };
}
