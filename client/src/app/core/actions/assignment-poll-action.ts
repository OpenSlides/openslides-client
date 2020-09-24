import { AssignmentAnalogVoteData } from 'app/core/repositories/assignments/assignment-poll-repository.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace AssignmentPollAction {
    type GlobalYPollMethod = { [key: number]: number } | 'N' | 'A';
    interface PartialPayload {
        // Optional, every state
        description?: string;
        onehundred_percent_base?: string;
        majority_method?: string;
    }
    interface PartialCreatePayload {
        // Optional, only if state == created
        pollmethod?: string;
        type?: string;
    }
    interface CreatePayload extends PartialPayload, PartialCreatePayload {
        // Required
        assignment_id: Id;
        title: string;

        // Optional
        votes_amount?: number;
        allow_multiple_votes_per_candidate?: boolean;
        global_abstain?: boolean;
        global_no?: boolean;
    }
    interface CanPublishImmediately {
        // Only for type==analog, optional: votes can be directly given
        votes?: AssignmentAnalogVoteData;
        publish_immediately?: boolean;
    }
    interface NonAnalogPayload {
        // Only for non analog types
        entitled_group_ids?: Id[];
    }
    interface UpdateCreatedPayload extends UpdatePayload, PartialCreatePayload {}

    export interface UpdatePayload extends Identifiable, PartialPayload {
        title?: string;
    }
    export interface CreateAnalogPollPayload extends CreatePayload, CanPublishImmediately {}
    export interface CreateNonAnalogPollPayload extends CreatePayload, NonAnalogPayload {}
    export interface UpdateCreatedAnalogPollPayload extends UpdateCreatedPayload, CanPublishImmediately {}
    export interface UpdateCreatedNonAnalogPollPayload extends UpdateCreatedPayload, NonAnalogPayload {}

    export interface StartPayload extends Identifiable {}
    export interface StopPayload extends Identifiable {}
    export interface PublishPayload extends Identifiable {}
    export interface PseudoanonymizePayload extends Identifiable {}
    export interface ResetPayload extends Identifiable {}

    export interface VoteNonAnalogPollWithGlobalPayload extends Identifiable {
        value: GlobalYPollMethod;
    }
    export interface VoteNonAnalogPollNonGlobalPayload<PM> extends Identifiable {
        value: { [key: number]: PM };
    }
    export interface VoteAnalogPollPayload extends Identifiable {
        options: {
            [key: number]: {
                Y: number;
                N?: number;
                A?: number;
            };
        };
        votesvalid?: number;
        votesinvalid?: number;
        votescast?: number;
        global_no?: number;
        global_abstain?: number;
    }
}
