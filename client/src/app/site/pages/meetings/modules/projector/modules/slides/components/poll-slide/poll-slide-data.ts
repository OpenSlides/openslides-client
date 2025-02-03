import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import {
    EntitledUsersEntry,
    PollMethod,
    PollPercentBase,
    PollState,
    PollType
} from 'src/app/domain/models/poll/poll-constants';

import { TitleInformationWithAgendaItem } from '../../definitions';

export interface SlidePollOption {
    yes?: number;
    no?: number;
    abstain?: number;
    text?: string;
    content_object?: TitleInformation;
}

export const SlidePollOptionFields: (keyof SlidePollOption)[] = [`abstain`, `no`, `yes`];

interface TitleInformation extends TitleInformationWithAgendaItem {
    collection: string;
    [key: string]: any; // Each content object can have a variety of fields.
}

export interface PollSlideData {
    id: Id;
    content_object_id: Fqid;
    title_information: TitleInformation;
    title: string;
    description: string;
    type: PollType;
    state: PollState;
    global_yes: boolean;
    global_no: boolean;
    global_abstain: boolean;
    options: SlidePollOption[];

    // These keys are only available, if poll/state == "published"
    entitled_users_at_stop: EntitledUsersEntry[];
    pollmethod: PollMethod;
    onehundred_percent_base: PollPercentBase;
    votesvalid: number;
    votesinvalid: number;
    votescast: number;
    global_option: SlidePollOption;
}

export const PollSlideDataFields: (keyof PollSlideData)[] = [`votesvalid`, `votesinvalid`, `votescast`];
