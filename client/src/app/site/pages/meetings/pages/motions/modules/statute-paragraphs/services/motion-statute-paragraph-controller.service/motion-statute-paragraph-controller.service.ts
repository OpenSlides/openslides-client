import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionStatuteParagraph } from 'src/app/domain/models/motions/motion-statute-paragraph';
import { MotionStatuteParagraphRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewMotionStatuteParagraph } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionStatuteParagraphControllerService extends BaseMeetingControllerService<
    ViewMotionStatuteParagraph,
    MotionStatuteParagraph
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionStatuteParagraphRepositoryService
    ) {
        super(controllerServiceCollector, MotionStatuteParagraph, repo);
    }

    public create(...statuteParagraphs: Partial<MotionStatuteParagraph>[]): Promise<Identifiable[]> {
        return this.repo.bulkCreate(statuteParagraphs);
    }

    public update(update: Partial<MotionStatuteParagraph>, viewModel: ViewMotionStatuteParagraph): Promise<void> {
        return this.repo.update(update, viewModel);
    }

    public delete(viewModel: ViewMotionStatuteParagraph): Promise<void> {
        return this.repo.delete(viewModel);
    }
}
