import { Injectable } from '@angular/core';
import { MotionStatuteParagraphServiceModule } from '../../motion-statute-paragraph-service.module';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewMotionStatuteParagraph } from '../../view-models';
import { MotionStatuteParagraph } from 'src/app/domain/models/motions/motion-statute-paragraph';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { MotionStatuteParagraphRepositoryService } from 'src/app/gateways/repositories/motions';

@Injectable({
    providedIn: MotionStatuteParagraphServiceModule
})
export class MotionStatuteParagraphControllerService extends BaseMeetingControllerService<
    ViewMotionStatuteParagraph,
    MotionStatuteParagraph
> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionStatuteParagraphRepositoryService
    ) {
        super(controllerServiceCollector, MotionStatuteParagraph, repo);
    }
}
