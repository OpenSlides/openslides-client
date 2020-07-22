import { Injectable } from '@angular/core';

import { MotionOption } from 'app/shared/models/motions/motion-option';
import { ViewMotionOption } from 'app/site/motions/models/view-motion-option';
import { BaseRepository } from '../base-repository';
import { MeetingModelBaseRepository } from '../meeting-model-base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Options.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class MotionOptionRepositoryService extends MeetingModelBaseRepository<ViewMotionOption, MotionOption> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionOption);
    }

    public getTitle = (viewMotionOption: ViewMotionOption) => {
        return 'Option';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Options' : 'Option');
    };
}
