import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { ViewPoll } from './view-poll';

export interface VotingTextContext<C extends BaseViewModel = any> {
    poll: ViewPoll<C>;
    translateFn: (text: string) => string;
}

export interface HasPolls<C extends BaseViewModel = any> {
    polls: ViewPoll<C>[];
    getVotingText: (context: VotingTextContext<C>) => string;
}

export function isHavingViewPolls(item: any): item is HasPolls {
    const isViewPollArray = Array.isArray(item?.polls) && !item.polls.some(value => !(value instanceof ViewPoll));
    return typeof item === `object` && isViewPollArray;
}
