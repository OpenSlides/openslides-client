import { TitleInformationWithAgendaItem } from '../agenda_item_number';
import { Fqid } from 'app/core/definitions/key-types';
import {
    EntitledUsersEntry,
    PollMethod,
    PollPercentBase,
    PollState,
    PollType
} from 'app/shared/models/poll/poll-constants';

export interface SlideOption {
    yes?: number;
    no?: number;
    abstain?: number;
    text?: string;
    content_object?: TitleInformation;
}

interface TitleInformation extends TitleInformationWithAgendaItem {
    collection: string;
    [key: string]: any; // Each content object can have a variety of fields.
}

export interface PollSlideData {
    content_object_id: Fqid;
    title_information: TitleInformation;
    title: string;
    description: string;
    type: PollType;
    state: PollState;
    global_yes: boolean;
    global_no: boolean;
    global_abstain: boolean;
    options: SlideOption[];

    // These keys are only available, if poll/state == "published"
    entitled_users_at_stop: EntitledUsersEntry[];
    is_pseudoanonymized: boolean;
    pollmethod: PollMethod;
    onehundred_percent_base: PollPercentBase;
    votesvalid: number;
    votesinvalid: number;
    votescast: number;
    global_option: SlideOption;
}
