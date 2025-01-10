import { _ } from '@ngx-translate/core';

export type TopicPollMethodKey = keyof typeof TopicPollMethodVerbose;

export const TopicPollMethodVerbose = {
    Y: _(`Yes per option`)
};

export const TopicPollPercentBaseVerbose = {
    Y: _(`Sum of votes`)
};

export const TopicPollTypeVerbose = {
    pseudoanonymous: _(`non-nominal`)
};
