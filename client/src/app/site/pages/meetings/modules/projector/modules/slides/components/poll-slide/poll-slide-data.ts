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
    votes?: SlidePollVote[];
}

export interface SlidePollVote {
    user_id: Id;
    user?: SlidePollUser;
    value: string;
}

export interface SlidePollUser {
    id: string;
    first_name: string;
    last_name: string;
    title: string;
}

export const SlidePollOptionFields: (keyof SlidePollOption)[] = [`abstain`, `no`, `yes`];

interface TitleInformation extends TitleInformationWithAgendaItem {
    collection: string;
    [key: string]: any; // Each content object can have a variety of fields.
}

export interface PollSlideEntitledUsersEntry extends EntitledUsersEntry {
    user?: SlidePollUser;
    structure_level_id?: Id;
    meeting_user_id?: Id;
}

export interface PollSlideLiveEntitledUsersEntry {
    present: boolean;
    structure_level_id: Id;
    user_data: SlidePollUser;
    votes: any;
    weight: string;
}

export type PollSlideLiveEntitledUsers = Record<number, PollSlideLiveEntitledUsersEntry>;

export type PollSlideLiveEntitledStructureLevels = Record<number, string>;

export interface PollSlideData {
    id: Id;
    content_object_id: Fqid;
    title_information: TitleInformation;
    title: string;
    description: string;
    type: PollType;
    state: PollState;
    live_voting_enabled: boolean;
    global_yes: boolean;
    global_no: boolean;
    global_abstain: boolean;
    options: SlidePollOption[];

    entitled_users: PollSlideLiveEntitledUsers;
    entitled_structure_levels: PollSlideLiveEntitledStructureLevels;

    // These keys are only available, if poll/state == "published"
    entitled_users_at_stop: PollSlideEntitledUsersEntry[];
    pollmethod: PollMethod;
    onehundred_percent_base: PollPercentBase;
    votesvalid: number;
    votesinvalid: number;
    votescast: number;
    global_option: SlidePollOption;
    is_pseudoanonymized: boolean;
}

export const PollSlideDataFields: (keyof PollSlideData)[] = [`votesvalid`, `votesinvalid`, `votescast`];
