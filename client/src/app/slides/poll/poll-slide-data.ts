import { Fqid } from 'app/core/definitions/key-types';
import {
    EntitledUsersEntry,
    PollMethod,
    PollPercentBase,
    PollState,
    PollType
} from 'app/shared/models/poll/poll-constants';
import { PollData } from 'app/site/polls/services/poll.service';

export interface GlobalOption {
    yes?: number;
    no?: number;
    abstain?: number;
}

interface Option extends GlobalOption {
    text?: string;
    content_object?: any;
}

export interface PollSlideData extends PollData {
    content_object_id: Fqid;
    title_information: any;
    title: string;
    description: string;
    type: PollType;
    state: PollState;
    global_yes: boolean;
    glboal_no: boolean;
    global_abstain: boolean;
    options: Option[];

    // These keys are only available, if poll/state == "published"
    entitled_users_at_stop: EntitledUsersEntry[];
    is_pseudoanonymized: boolean;
    pollmethod: PollMethod;
    onehundred_percent_base: PollPercentBase;
    votesvalid: number;
    votesinvalid: number;
    votescast: number;
    global_option: GlobalOption;
}
