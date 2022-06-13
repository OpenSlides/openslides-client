import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { ViewPoll } from './view-poll';

export interface HasPolls<C extends BaseViewModel = any> {
    polls: ViewPoll<C>[];
    getVotingText: (translateFn: (text: string) => string, poll?: ViewPoll<C>) => string;
}

export function isHavingViewPolls(item: any): item is HasPolls {
    const isViewPollArray = Array.isArray(item?.polls) && !item.polls.some(value => !(value instanceof ViewPoll));
    return typeof item === `object` && isViewPollArray;
}
