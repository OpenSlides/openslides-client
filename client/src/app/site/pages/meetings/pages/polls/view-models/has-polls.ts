import { PollContentObject } from 'src/app/domain/models/poll';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { ViewPoll } from './view-poll';

export type HasPoll<C extends PollContentObject = any> = ViewModelRelations<{
    poll: ViewPoll<C>;
}>;
export type VotingTextContext<C extends PollContentObject = any> = ViewModelRelations<{
    poll: ViewPoll<C>;
}> & {
    translateFn: (text: string) => string;
};

export type HasPolls<C extends PollContentObject = any> = ViewModelRelations<{
    polls: ViewPoll<C>[];
}> & {
    getVotingText: (context: VotingTextContext<C>) => string;
};

export function isHavingViewPolls(item: any): item is HasPolls {
    const isViewPollArray = Array.isArray(item?.polls) && !item.polls.some(value => !(value instanceof ViewPoll));
    return typeof item === `object` && isViewPollArray;
}
