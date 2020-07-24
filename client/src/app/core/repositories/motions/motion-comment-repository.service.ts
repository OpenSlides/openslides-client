import { Injectable } from '@angular/core';

import { MotionComment } from 'app/shared/models/motions/motion-comment';
import { ViewMotionComment } from 'app/site/motions/models/view-motion-comment';
import { BaseRepository } from '../base-repository';
import { MeetingModelBaseRepository } from '../meeting-model-base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { Fieldsets, DEFAULT_FIELDSET } from 'app/core/core-services/model-request-builder.service';

@Injectable({
    providedIn: 'root'
})
export class MotionCommentRepositoryService extends MeetingModelBaseRepository<ViewMotionComment, MotionComment> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionComment);
    }

    public getTitle = (viewMotionComment: ViewMotionComment) => {
        return 'Comment';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Comments' : 'Comment');
    };

    public getFieldsets(): Fieldsets<ViewMotionComment> {
        const commentFields: (keyof ViewMotionComment)[] = ['comment'];
        return {
            [DEFAULT_FIELDSET]: commentFields,
        };
    }
}
