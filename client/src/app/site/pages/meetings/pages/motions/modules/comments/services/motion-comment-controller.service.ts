import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { MotionComment } from '@app/domain/models/motions/motion-comment';
import { MotionCommentRepositoryService } from '@app/gateways/repositories/motions/motion-comments';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';

import { ViewMotionComment } from '../view-models';

@Service()
export class MotionCommentControllerService extends BaseMeetingControllerService<ViewMotionComment, MotionComment> {
    protected repo: MotionCommentRepositoryService = inject(MotionCommentRepositoryService);

    public baseModelCtor = MotionComment;

    public create(comment: Partial<MotionComment>): Promise<Identifiable> {
        return this.repo.create(comment);
    }

    public update(update: Partial<MotionComment>, comment: Identifiable): Promise<void> {
        return this.repo.update(update, comment);
    }

    public delete(comment: Identifiable): Promise<void> {
        return this.repo.delete(comment);
    }
}
