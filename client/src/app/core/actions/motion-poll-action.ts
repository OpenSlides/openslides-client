import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';
import { MotionAnalogVoteData } from '../repositories/motions/motion-poll-repository.service';

export namespace MotionPollAction {
    interface UserIdentifier {
        user_id?: Id;
    }
    interface PartialPayload {
        // Optional, every state
        onehundred_percent_base?: string;
        majority_method?: string;
    }
    interface PartialCreatePayload {
        // Optional
        pollmethod?: string;
        type?: string;
    }
    interface CanPublishImmediately {
        // Only for type==analog, optional: votes can be directly given
        votes?: MotionAnalogVoteData;
        publish_immediately?: boolean;
    }
    interface NonAnalogPayload {
        // Only for non analog types
        entitled_group_ids?: Id[];
    }
    interface CreatePayload extends PartialPayload, PartialCreatePayload {
        // Required
        motion_id: Id;
        title: string;
    }
    interface UpdatePayload extends Identifiable, PartialPayload {
        // Optional, every state
        title?: string;
    }

    export interface CreateAnalogPollPayload extends CreatePayload, CanPublishImmediately {}
    export interface CreateNonAnalogPollPayload extends CreatePayload, NonAnalogPayload {}
    export interface UpdateCreatedAnalogPollPayload extends UpdatePayload, PartialCreatePayload {}
    export interface UpdateCreatedNonAnalogPollPayload extends UpdateCreatedAnalogPollPayload, NonAnalogPayload {}
    export interface UpdateAnalogPollPayload extends UpdatePayload, CanPublishImmediately {}

    export interface StartPayload extends Identifiable {}
    export interface StopPayload extends Identifiable {}
    export interface PublishPayload extends Identifiable {}
    export interface PseudoanonymizePayload extends Identifiable {}
    export interface ResetPayload extends Identifiable {}
    export interface VoteNonAnalogPollPayload<PM> extends Identifiable, UserIdentifier {
        value: PM;
    }
    export type VoteAnalogPollPayload = {
        [K in keyof MotionAnalogVoteData];
    } &
        Identifiable &
        UserIdentifier;
}
