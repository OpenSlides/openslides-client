import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export enum Projectiondefault {
    agendaAllItems = `agenda_all_items`,
    topics = `topics`,
    listOfSpeakers = `list_of_speakers`,
    currentListOfSpeakers = `current_list_of_speakers`,
    motion = `motion`,
    amendment = `amendment`,
    motionBlock = `motion_block`,
    assignment = `assignment`,
    mediafile = `mediafile`,
    projectorMessage = `projector_message`,
    projectorCountdown = `projector_countdowns`,
    assignmentPoll = `assignment_poll`,
    motionPoll = `motion_poll`,
    poll = `poll`
}

export const ProjectiondefaultVerbose: { [key in keyof typeof Projectiondefault]: string } = {
    agendaAllItems: _(`Agenda`),
    topics: _(`Topics`),
    listOfSpeakers: _(`List of speakers`),
    currentListOfSpeakers: _(`Current list of speakers`),
    motion: _(`Motions`),
    amendment: _(`Amendments`),
    motionBlock: _(`Motion blocks`),
    assignment: _(`Elections`),
    mediafile: _(`Files`),
    projectorMessage: _(`Messages`),
    projectorCountdown: _(`Countdowns`),
    assignmentPoll: _(`Ballots`),
    motionPoll: _(`Motion votes`),
    poll: _(`Polls`)
};
