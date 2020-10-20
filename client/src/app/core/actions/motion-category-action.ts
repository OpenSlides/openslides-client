import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseSortPayload } from './common/base-sort-payload';
import { Id } from '../definitions/key-types';

export namespace MotionCategoryAction {
    export const CREATE = 'motion_category.create';
    export const UPDATE = 'motion_category.update';
    export const DELETE = 'motion_category.delete';
    export const SORT = 'motion_category.sort';
    export const SORT_MOTIONS_IN_CATEGORY = 'motion_category.sort_motions_in_category';
    export const NUMBER_MOTIONS = 'motion_category.number_motions';

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
    export interface SortPayload extends HasMeetingId, BaseSortPayload {}
    export interface SortMotionsInCategoryPayload extends Identifiable {
        motion_ids: Id[];
    }
    export interface NumberMotionsPayload extends Identifiable {}
}
