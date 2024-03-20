import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionComment } from 'src/app/domain/models/motions/motion-comment';
import { MotionCommentRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewMotionComment } from '../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionCommentControllerService extends BaseMeetingControllerService<ViewMotionComment, MotionComment> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionCommentRepositoryService
    ) {
        super(controllerServiceCollector, MotionComment, repo);
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
