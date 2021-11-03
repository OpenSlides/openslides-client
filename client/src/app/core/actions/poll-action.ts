import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';

import { Decimal, Fqid, Id } from '../definitions/key-types';

export namespace PollAction {
    export const CREATE = `poll.create`;
    export const UPDATE = `poll.update`;
    export const DELETE = `poll.delete`;

    export const PUBLISH = `poll.publish`;
    export const RESET = `poll.reset`;
    export const START = `poll.start`;
    export const STOP = `poll.stop`;
    export const ANONYMIZE = `poll.anonymize`;
    export const VOTE = `poll.vote`;
    export const UPDATE_OPTION = `option.update`;

    interface UserIdentifiable {
        user_id: Id;
    }

    type YNA = 'Y' | 'N' | 'A';

    interface Option {
        // Exactly one of text and content_object_id must be given
        text?: string;
        content_object_id?: Fqid;
    }

    export interface AnalogOption extends Option {
        // Only for type==analog, optional votes can be given
        Y?: Decimal; // Y, YN, YNA mode
        N?: Decimal; // N, YN mode
        A?: Decimal; // YNA mode
    }

    export interface ElectronicOption extends Option {}

    interface AnalogVotesPayload {
        votesvalid?: Decimal;
        votesinvalid?: Decimal;
        votescast?: Decimal;
    }

    interface AnalogGlobalAmountPayload {
        // Only for type==analog, optional votes can be given
        amount_global_yes?: Decimal;
        amount_global_no?: Decimal;
        amount_global_abstain?: Decimal;
    }

    interface PartialCreatePayload extends HasMeetingId {
        // Required
        title: string;
        type: string;
        pollmethod: string;

        options: Option[]; // must have at least one entry.

        // Optional
        content_object_id?: Fqid;
        description?: string;
        min_votes_amount?: number;
        max_votes_amount?: number;
        global_yes?: boolean;
        global_no?: boolean;
        global_abstain?: boolean;
        onehundred_percent_base?: string;
    }

    interface PartialUpdatePayload {
        // Optional, every state
        title?: string;
        description?: string;
        onehundred_percent_base?: string;
    }

    interface PartialUpdateCreatedPollPayload {
        // Optional, only if state == created
        pollmethod?: string;
        min_votes_amount?: number;
        max_votes_amount?: number;
        allow_multiple_votes_per_candidate?: boolean;
    }

    interface PartialUpdateAnalogPayload extends AnalogVotesPayload, AnalogGlobalAmountPayload {
        // type==analog, every state
    }
    export interface CreateAnalogPollPayload
        extends PartialCreatePayload,
            AnalogVotesPayload,
            AnalogGlobalAmountPayload {
        options: AnalogOption[];

        // Only for type==analog
        publish_immediately?: boolean;
    }

    export interface CreateElectronicPollPayload extends PartialCreatePayload {
        options: ElectronicOption[];
        // Only for non analog types
        entitled_group_ids?: Id[];
    }

    export interface UpdateAnalogPollPayload
        extends Identifiable,
            PartialUpdatePayload,
            PartialUpdateCreatedPollPayload,
            PartialUpdateAnalogPayload {
        // Only for type==analog
        publish_immediately?: boolean;
    }

    export interface UpdateElectronicPollPayload
        extends Identifiable,
            PartialUpdatePayload,
            PartialUpdateCreatedPollPayload {
        // Optional, only if state == created, only for non analog types
        entitled_group_ids: Id[];
    }

    export interface UpdateOtherStateAnalogPollPayload
        extends Identifiable,
            PartialUpdatePayload,
            PartialUpdateAnalogPayload {
        publish_immediately?: boolean;
    }

    export interface DeletePollPayload extends Identifiable {}

    export interface ResetPollPayload extends Identifiable {}
    export interface StartPollPayload extends Identifiable {}
    export interface StopPollPayload extends Identifiable {}
    export interface PublishPollPayload extends Identifiable {}
    export interface AnonymizePollPayload extends Identifiable {}

    /**
     * Only for non-analog polls
     */
    export interface YNVotePayload extends Identifiable, UserIdentifiable {
        value: { [option_id: number]: number } | YNA;
    }

    /**
     * Only for non-analog polls
     */
    export interface YNAVotePayload extends Identifiable, UserIdentifiable {
        value: { [option_id: number]: YNA } | YNA;
    }

    export interface OptionUpdatePayload extends Identifiable {
        Y?: number;
        N?: number;
        A?: number;
        publish_immediately?: boolean;
    }
}
