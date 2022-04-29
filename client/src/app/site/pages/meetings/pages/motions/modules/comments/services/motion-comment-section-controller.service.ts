import { Injectable } from '@angular/core';
import { MotionCommentSection } from 'src/app/domain/models/motions/motion-comment-section';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MotionCommentCommonServiceModule } from '../motion-comment-common-service.module';
import { ViewMotionCommentSection } from '../view-models';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { MotionCommentSectionRepositoryService } from 'src/app/gateways/repositories/motions';

@Injectable({
    providedIn: MotionCommentCommonServiceModule
})
export class MotionCommentSectionControllerService extends BaseMeetingControllerService<
    ViewMotionCommentSection,
    MotionCommentSection
> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionCommentSectionRepositoryService
    ) {
        super(controllerServiceCollector, MotionCommentSection, repo);
    }
}
