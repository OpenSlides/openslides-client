import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';
import { MotionAction } from './motion-action';

export namespace AmendmentAction {
    export const CREATE_PARAGRAPHBASED_AMENDMENT = 'motion.create';
    export const CREATE_TEXTBASED_AMENDMENT = 'motion.create';
    export const CREATE_STATUTEBASED_AMENDMENT = 'motion.create';
    export const UPDATE = 'motion.update';
    export const DELETE = 'motion.delete';

    interface PartialAmendmentPayload extends MotionAction.PartialMotionCreatePayload {
        lead_motion_id: Id;
    }

    interface ParagraphChange {
        [paragraph_number: number]: UnsafeHtml;
    }

    export interface CreateParagraphbasedPayload extends PartialAmendmentPayload {
        amendment_paragraph_$: ParagraphChange;
    }

    export interface CreateTextbasedPayload extends PartialAmendmentPayload {
        text: UnsafeHtml;
    }

    export interface CreateStatutebasedPayload extends MotionAction.PartialMotionCreatePayload {
        statute_paragraph_id: Id;
        text: UnsafeHtml;
    }

    export interface UpdatePayload extends MotionAction.UpdatePayload {}

    export interface DeletePayload extends Identifiable {}
}
