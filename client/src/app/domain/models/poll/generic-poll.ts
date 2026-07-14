import { ViewTopic } from 'src/app/site/pages/meetings/pages/agenda';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ViewMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';

import { PollConfigApproval } from './poll-config-approval';
import { PollConfigRatingApproval } from './poll-config-rating-approval';
import { PollConfigRatingScore } from './poll-config-rating-score';
import { PollConfigSelection } from './poll-config-selection';

export type PollContentObject = ViewAssignment | ViewMotion | ViewTopic;
export type AnyPollConfig = PollConfigApproval | PollConfigRatingApproval | PollConfigRatingScore | PollConfigSelection;

/**
 * The main interface to describe everything related to polls
 * This is a unification of the data received in the projector and ViewPoll; both
 * use this interface, so the poll services can work on this shared view on the data.
 */

export interface OptionTitle {
    title: string;
    subtitle?: string;
}

export interface OptionData {
    getOptionTitle: () => OptionTitle;
    yes?: number;
    no?: number;
    abstain?: number;
    weight?: number;
    votesvalid?: number;
    votesinvalid?: number;
    votescast?: number;
    amount_global_yes?: number;
    amount_global_no?: number;
    amount_global_abstain?: number;
    meeting_user?: ViewMeetingUser;
    text?: string;
    entries_amount?: number;
}

export type OptionDataKey = keyof OptionData;
