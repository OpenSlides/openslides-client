import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export type TopicPollMethodKey = keyof typeof TopicPollMethodVerbose;

export const TopicPollMethodVerbose = {
    Y: _(`Yes per option`)
};

export const TopicPollPercentBaseVerbose = {
    Y: _(`Sum of votes`)
};

export const TopicPollTypeVerbose = {
    pseudoanonymous: _(`non-nominal`),
    cryptographic: _(`cryptographic`)
};

export enum TopicPollType {
    Pseudoanonymous = `pseudoanonymous`,
    Cryptographic = `cryptographic`
}
