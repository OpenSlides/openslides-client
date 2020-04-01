import { Injectable } from '@angular/core';

import { MotionOption } from 'app/shared/models/motions/motion-option';
import { ViewMotionOption } from 'app/site/motions/models/view-motion-option';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Options.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class MotionOptionRepositoryService extends BaseRepository<ViewMotionOption, MotionOption, object> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionOption);
    }

    public getTitle = (titleInformation: object) => {
        return 'Option';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Options' : 'Option');
    };
}
