import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

export const PROJECTIONDEFAULT = {
    agendaItemList: `agenda_item_list`,
    topics: `topic`,
    listOfSpeakers: `list_of_speakers`,
    currentListOfSpeakers: `current_list_of_speakers`,
    motion: `motion`,
    amendment: `amendment`,
    motionBlock: `motion_block`,
    assignment: `assignment`,
    mediafile: `mediafile`,
    projectorMessage: `message`,
    projectorCountdown: `countdown`,
    assignmentPoll: `assignment_poll`,
    motionPoll: `motion_poll`,
    poll: `poll`
} as const;

export type ProjectiondefaultKey = keyof typeof PROJECTIONDEFAULT;

export type ProjectiondefaultValue = (typeof PROJECTIONDEFAULT)[ProjectiondefaultKey];

export const PROJECTIONDEFAULT_VERBOSE: { [key in ProjectiondefaultKey]: string } = {
    agendaItemList: _(`Agenda`),
    topics: _(`Topics`),
    listOfSpeakers: _(`List of speakers`),
    currentListOfSpeakers: _(`Current list of speakers`),
    motion: _(`Motions`),
    amendment: _(`Amendments`),
    motionBlock: _(`Motion blocks`),
    assignment: _(`Elections`),
    mediafile: _(`Files`),
    projectorMessage: _(`Messages`),
    projectorCountdown: _(`Countdowns/Timers`),
    assignmentPoll: _(`Ballots`),
    motionPoll: _(`Motion votes`),
    poll: _(`Polls`)
};

export const PROJECTIONDEFAULTS = Object.values(PROJECTIONDEFAULT) as ProjectiondefaultValue[];

export const PROJECTIONDEFAULT_KEYS = Object.values(PROJECTIONDEFAULT) as ProjectiondefaultKey[];
