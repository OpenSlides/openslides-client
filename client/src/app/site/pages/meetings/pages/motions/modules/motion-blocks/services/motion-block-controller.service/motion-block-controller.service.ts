import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { MotionBlock } from '@app/domain/models/motions/motion-block';
import { MotionBlockRepositoryService } from '@app/gateways/repositories/motions/motion-block-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';

import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';
import { ViewMotionBlock } from '../../view-models/view-motion-block';

@Service()
export class MotionBlockControllerService extends BaseMeetingControllerService<ViewMotionBlock, MotionBlock> {
    protected repo: MotionBlockRepositoryService = inject(MotionBlockRepositoryService);
    private motionRepo = inject(MotionControllerService);

    public baseModelCtor = MotionBlock;

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
