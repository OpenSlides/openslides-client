import { Injectable } from '@angular/core';
import { MotionBlockCommonServiceModule } from '../../motion-block-common-service.module';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewMotionBlock } from '../../view-models';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { MotionBlockRepositoryService } from 'src/app/gateways/repositories/motions';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';

@Injectable({
    providedIn: MotionBlockCommonServiceModule
})
export class MotionBlockControllerService extends BaseMeetingControllerService<ViewMotionBlock, MotionBlock> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionBlockRepositoryService,
        private motionRepo: MotionControllerService
    ) {
        super(controllerServiceCollector, MotionBlock, repo);
    }

    public create(...blocks: Partial<MotionBlock>[]): Promise<Identifiable[]> {
        return this.repo.create(...blocks);
    }

    public update(update: Partial<MotionBlock>, motionBlock: Identifiable): Promise<void> {
        return this.repo.update(update, motionBlock);
    }

    public delete(...motionBlocks: Identifiable[]): Promise<void> {
        return this.repo.delete(...motionBlocks);
    }

    public followRecommendation(motionBlock: MotionBlock): Promise<void> {
        return this.motionRepo.followRecommendation(...motionBlock.motion_ids.map(id => ({ id })));
    }

    /**
     * Retrieves motion blocks by name
     *
     * @param title String to check for
     * @returns the motion blocks found
     */
    public getMotionBlocksByTitle(title: string): MotionBlock[] {
        return this.getViewModelList().filter(block => block.title === title);
    }
}
