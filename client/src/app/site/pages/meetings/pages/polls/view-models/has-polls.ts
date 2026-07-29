import { PollContentObject } from '@app/domain/models/poll';
import { ViewModelRelations } from '@app/site/base/base-view-model';

import { BasePollConfigViewModel } from './base-poll-config-view-model';
import { ViewPoll } from './poll';

export type HasPoll<C extends PollContentObject = any> = ViewModelRelations<{
    poll: ViewPoll<C>;
}>;
export type VotingTextContext<C extends PollContentObject = any> = ViewModelRelations<{
    poll: ViewPoll<C>;
}> & {
    translateFn: (text: string) => string;
};

export type HasPolls<C extends PollContentObject = any, D extends BasePollConfigViewModel = any> = ViewModelRelations<{
    polls: ViewPoll<C, D>[];
}> & {
    getVotingText: (context: VotingTextContext<C>) => string;
};

export function isHavingViewPolls(item: any): item is HasPolls {
    const isViewPollArray = Array.isArray(item?.polls) && !item.polls.some(value => !(value instanceof ViewPoll));
    return typeof item === `object` && isViewPollArray;
}
