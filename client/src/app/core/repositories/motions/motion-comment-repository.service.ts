import { Injectable } from '@angular/core';

import { MotionCommentAction } from 'app/core/actions/motion-comment-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionComment } from 'app/shared/models/motions/motion-comment';
import { ViewMotionComment } from 'app/site/motions/models/view-motion-comment';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class MotionCommentRepositoryService extends BaseRepositoryWithActiveMeeting<ViewMotionComment, MotionComment> {
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
        const commentFields: (keyof ViewMotionComment)[] = ['motion_id', 'section_id', 'comment'];
        return {
            [DEFAULT_FIELDSET]: commentFields
        };
    }

    public async create(partialModel: Partial<MotionComment>): Promise<Identifiable> {
        const payload: MotionCommentAction.CreatePayload = {
            comment: partialModel.comment,
            section_id: partialModel.section_id,
            motion_id: partialModel.motion_id
        };
        return this.sendActionToBackend(MotionCommentAction.CREATE, payload);
    }

    public async update(update: Partial<MotionComment>, viewModel: ViewMotionComment): Promise<void> {
        const payload: MotionCommentAction.UpdatePayload = {
            comment: update.comment,
            id: viewModel.id
        };
        return this.sendActionToBackend(MotionCommentAction.UPDATE, payload);
    }

    public async delete(viewModel: ViewMotionComment): Promise<void> {
        return this.sendActionToBackend(MotionCommentAction.DELETE, { id: viewModel.id });
    }
}
