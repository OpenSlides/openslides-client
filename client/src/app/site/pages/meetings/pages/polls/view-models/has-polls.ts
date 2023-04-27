import { PollContentObject } from 'src/app/domain/models/poll';

import { ViewPoll } from './view-poll';

export interface VotingTextContext<C extends PollContentObject = any> {
    poll: ViewPoll<C>;
    translateFn: (text: string) => string;
}

export interface HasPolls<C extends PollContentObject = any> {
    polls: ViewPoll<C>[];
    getVotingText: (context: VotingTextContext<C>) => string;
}

export function isHavingViewPolls(item: any): item is HasPolls {
    const isViewPollArray = Array.isArray(item?.polls) && !item.polls.some(value => !(value instanceof ViewPoll));
    return typeof item === `object` && isViewPollArray;
}
