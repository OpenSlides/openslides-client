import { Id } from '../definitions/key-types';
import { MotionAction } from './motion-action';

export namespace AmendmentAction {
    export interface CreatePayload extends MotionAction.CreatePayload {
        lead_motion_id: Id;
    }
}
