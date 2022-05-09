import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionComment } from 'src/app/domain/models/motions/motion-comment';
import { MotionCommentRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';

import { MotionCommentCommonServiceModule } from '../motion-comment-common-service.module';
import { ViewMotionComment } from '../view-models';

@Injectable({
    providedIn: MotionCommentCommonServiceModule
})
export class MotionCommentControllerService extends BaseMeetingControllerService<ViewMotionComment, MotionComment> {
    constructor(protected override repo: MotionCommentRepositoryService) {
        super(MotionComment, repo);
    }

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
