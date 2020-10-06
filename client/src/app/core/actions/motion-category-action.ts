import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';
import { SortingPayload } from './sorting-payload';

export namespace MotionCategoryAction {
    export interface CreatePayload extends HasMeetingId {
        name: string;
        prefix: string;
        parent_id?: Id;
    }
    export interface UpdatePayload extends Identifiable {
        name?: string;
        prefix?: string;
        motion_ids?: Id[];
    }
    export interface SortPayload extends HasMeetingId, SortingPayload {}
    export interface SortMotionsInCategoryPayload extends Identifiable {
        motion_ids: Id[];
    }
    export interface NumberMotionsPayload extends Identifiable {}
}
