import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionComment } from 'src/app/domain/models/motions/motion-comment';
import { ViewMotionComment } from 'src/app/site/pages/meetings/pages/motions';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionCommentAction } from './motion-comment.action';

@Injectable({
    providedIn: `root`
})
export class MotionCommentRepositoryService extends BaseMeetingRelatedRepository<ViewMotionComment, MotionComment> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionComment);
    }

    public getTitle = (viewMotionComment: ViewMotionComment) => `Comment`;

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Comments` : `Comment`);

    public async create(partialModel: Partial<MotionComment>): Promise<Identifiable> {
        const payload = {
            comment: partialModel.comment,
            section_id: partialModel.section_id,
            motion_id: partialModel.motion_id
        };
        return this.sendActionToBackend(MotionCommentAction.CREATE, payload);
    }

    public async update(update: Partial<MotionComment>, viewModel: Identifiable): Promise<void> {
        const payload = {
            comment: update.comment,
            id: viewModel.id
        };
        return this.sendActionToBackend(MotionCommentAction.UPDATE, payload);
    }

    public async delete(viewModel: Identifiable): Promise<void> {
        return this.sendActionToBackend(MotionCommentAction.DELETE, { id: viewModel.id });
    }
}
