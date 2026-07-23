import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { MotionCommentSection } from '@app/domain/models/motions/motion-comment-section';
import { MotionCommentSectionRepositoryService } from '@app/gateways/repositories/motions';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewMotionCommentSection } from '../view-models';

@Service()
export class MotionCommentSectionControllerService extends BaseMeetingControllerService<
    ViewMotionCommentSection,
    MotionCommentSection
> {
    protected override repo: MotionCommentSectionRepositoryService;

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(MotionCommentSectionRepositoryService);
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
