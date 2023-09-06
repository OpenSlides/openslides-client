import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { MotionBlockRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';
import { ViewMotionBlock } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionBlockControllerService extends BaseMeetingControllerService<ViewMotionBlock, MotionBlock> {
    public constructor(
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

    public followRecommendation(motionBlock: ViewMotionBlock): Promise<void> {
        return this.motionRepo.followRecommendation(
            ...motionBlock.motions.filter(motion =>
                (motion.state?.next_state_ids ?? [])
                    .concat(motion.state?.previous_state_ids ?? [])
                    .includes(motion.recommendation_id)
            )
        );
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
