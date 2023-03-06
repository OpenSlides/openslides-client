import { PROJECTIONDEFAULT, Projectiondefault } from 'src/app/domain/models/projector/projection-default';

import { MotionBlock } from '../../../../../../../../domain/models/motions/motion-block';
import { BaseProjectableViewModel } from '../../../../../view-models/base-projectable-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { HasAgendaItem } from '../../../../agenda';
import { HasListOfSpeakers } from '../../../../agenda/modules/list-of-speakers';
import { ViewMotion } from '../../../view-models/view-motion';

export class ViewMotionBlock extends BaseProjectableViewModel<MotionBlock> {
    public static COLLECTION = MotionBlock.COLLECTION;
    protected _collection = MotionBlock.COLLECTION;

    public get motionBlock(): MotionBlock {
        return this._model;
    }

    /**
     * A block is finished when all its motions are in a final state
     */
    public get isFinished(): boolean {
        return this.motions && !!this.motions.length && this.motions.every(motion => motion.isInFinalState());
    }

    /**
     * Get the URL to the motion block
     *
     * @returns the URL as string
     */
    public override getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/motions/blocks/${this.sequential_number}`;
    }

    public getProjectiondefault(): Projectiondefault {
        return PROJECTIONDEFAULT.motionBlock;
    }
}
interface IMotionBlockRelations {
    motions: ViewMotion[];
}
export interface ViewMotionBlock
    extends MotionBlock,
        IMotionBlockRelations,
        // Searchable,
        HasMeeting,
        HasAgendaItem,
        HasListOfSpeakers {}
