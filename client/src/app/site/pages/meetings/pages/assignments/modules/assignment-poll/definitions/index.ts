import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export type AssignmentPollMethodKey = keyof typeof AssignmentPollMethodVerbose;

export const AssignmentPollMethodVerbose = {
    Y: _(`Yes per candidate`),
    N: _(`No per candidate`),
    YN: _(`Yes/No per candidate`),
    YNA: _(`Yes/No/Abstain per candidate`),
    yna: _(`Yes/No/Abstain per list`)
};

export const AssignmentPollPercentBaseVerbose = {
    Y: _(`Sum of votes without general options`),
    YN: _(`Yes/No per candidate`),
    YNA: _(`Yes/No/Abstain per option`),
    valid: _(`All valid ballots`),
    cast: _(`All casted ballots`),
    entitled: _(`All entitled users`),
    disabled: _(`Disabled (no percents)`)
};
