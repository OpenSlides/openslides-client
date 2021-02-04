import { AgendaItemCreationPayload } from './common/agenda-item-creation-payload';
import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace MotionBlockAction {
    export const CREATE = 'motion_block.create';
    export const UPDATE = 'motion_block.update';
    export const DELETE = 'motion_block.delete';

    export interface CreatePayload extends HasMeetingId, AgendaItemCreationPayload {
        title: string;
        internal: boolean;
    }
    export interface UpdatePayload extends Identifiable {
        title?: string;
        internal?: boolean;
        motion_ids?: Id[];
    }

    export interface DeletePayload extends Identifiable {}
}
