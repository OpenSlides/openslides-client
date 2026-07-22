import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { MotionComment } from '@app/domain/models/motions/motion-comment';
import { MotionCommentRepositoryService } from '@app/gateways/repositories/motions';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewMotionComment } from '../view-models';

@Service()
export class MotionCommentControllerService extends BaseMeetingControllerService<ViewMotionComment, MotionComment> {
    protected override repo: MotionCommentRepositoryService;

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(MotionCommentRepositoryService);
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
