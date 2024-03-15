import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionCommentSection } from 'src/app/domain/models/motions/motion-comment-section';
import { MotionCommentSectionRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewMotionCommentSection } from '../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionCommentSectionControllerService extends BaseMeetingControllerService<
    ViewMotionCommentSection,
    MotionCommentSection
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionCommentSectionRepositoryService
    ) {
        super(controllerServiceCollector, MotionCommentSection, repo);
    }

    public create(partialModel: Partial<MotionCommentSection>): Promise<Identifiable> {
        return this.repo.create(partialModel);
    }

    public update(update: Partial<ViewMotionCommentSection>, viewModel: ViewMotionCommentSection): Promise<void> {
        return this.repo.update(update, viewModel);
    }

    public delete(viewModel: ViewMotionCommentSection): Promise<void> {
        return this.repo.delete(viewModel);
    }

    public sortCommentSections(sections: ViewMotionCommentSection[]): Promise<void> {
        return this.repo.sortCommentSections(sections);
    }
}
