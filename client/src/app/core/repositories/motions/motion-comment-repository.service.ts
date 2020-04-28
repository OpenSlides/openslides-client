import { Injectable } from '@angular/core';

import { MotionComment } from 'app/shared/models/motions/motion-comment';
import { ViewMotionComment } from 'app/site/motions/models/view-motion-comment';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class MotionCommentRepositoryService extends BaseRepository<ViewMotionComment, MotionComment, {}> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionComment);
    }

    public getTitle = (titleInformation: {}) => {
        return 'Comment';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Comments' : 'Comment');
    };
}
