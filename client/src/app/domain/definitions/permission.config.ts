import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { Permission } from './permission';

export type PermissionsMap = { [key in Permission]?: Permission[] };

export interface DisplayPermission {
    display_name: string;
    help_text?: string;
    value: Permission;
}

export interface AppPermission {
    name: string;
    permissions: DisplayPermission[];
}

export const PERMISSIONS: AppPermission[] = [
    {
        name: `Projector`,
        permissions: [
            {
                display_name: _(`Can see the projector`),
                help_text: _(`Can see all projectors`),
                value: Permission.projectorCanSee
            },
            {
                display_name: _(`Can manage the projector`),
                help_text: _(`Can create, customise, control and delete projectors.`),
                value: Permission.projectorCanManage
            }
        ]
    },
    {
        name: `Agenda`,
        permissions: [
            {
                display_name: _(`Can see agenda`),
                help_text: _(`Can see all public topics in the agenda.`),
                value: Permission.agendaItemCanSee
            },
            {
                display_name: _(`Can see internal items and time scheduling of agenda`),
                help_text: _(`Can see all internal topics, schedules and comments.`),
                value: Permission.agendaItemCanSeeInternal
            },
            {
                display_name: _(`Can manage agenda`),
                help_text: _(
                    `Can create, modify and delete topics, add motions and assignments to the agenda, sort, number and keyword agenda items.`
                ),
                value: Permission.agendaItemCanManage
            },
            { display_name: _(`Can see list of speakers`), value: Permission.listOfSpeakersCanSee },
            {
                display_name: _(`Can manage list of speakers`),
                help_text: _(
                    `Can add speakers to the speaking list, mark, sort, start/stop and open/close the speaking list.`
                ),
                value: Permission.listOfSpeakersCanManage
            },
            {
                display_name: _(`Can put oneself on the list of speakers`),
                help_text: _(`Can add him/herself to the list of speakers, provided that he/she is present.`),
                value: Permission.listOfSpeakersCanBeSpeaker
            },
            {
                display_name: _(`Can manage polls`),
                help_text: _(`Can create, change, start/stop and delete polls.`),
                value: Permission.pollCanManage
            }
        ]
    },
    {
        name: `Motions`,
        permissions: [
            {
                display_name: _(`Can see motions`),
                help_text: _(`Can see all motions unless limited by access restrictions in the workflow.`),
                value: Permission.motionCanSee
            },
            {
                display_name: _(`Can see motions in internal state`),
                help_text: _(
                    `Can see motions in the internal state that are limited in the workflow with the same access restriction.`
                ),
                value: Permission.motionCanSeeInternal
            },
            {
                display_name: _(`Can create motions`),
                help_text: _(
                    `Can create motions and modify them later, depending on the workflow, but cannot delete them.`
                ),
                value: Permission.motionCanCreate
            },
            {
                display_name: _(`Can create amendments`),
                help_text: _(
                    `Can create amendments and modify them later, depending on the workflow, but cannot delete them.`
                ),
                value: Permission.motionCanCreateAmendments
            },
            {
                display_name: _(`Can forward motions`),
                help_text: _(
                    `Can forward motions to other events within the OpenSlides instance. Target events must be defined at the organisation level under Committees > Edit Committee. Motions must be in a state where forwarding is allowed.`
                ),
                value: Permission.motionCanForward
            },
            {
                display_name: _(`Can support motions`),
                help_text: _(
                    `Can support motions. The support function must be enabled both in > Settings > Motions and for the corresponding state in > Workflow.`
                ),
                value: Permission.motionCanSupport
            },
            {
                display_name: _(`Can manage motions`),
                help_text: _(
                    `Can create, modify and delete motions and votes, amendments and recommended amendments, and edit the metadata of a motion. Including the management of categories, request blocks, keywords, workflows, comment fields.`
                ),
                value: Permission.motionCanManage
            },
            {
                display_name: _(`Can manage motion metadata`),
                help_text: _(
                    `Can edit and assign motion metadata: Submitter, state, recommendation, category, block, keywords, supports.`
                ),
                value: Permission.motionCanManageMetadata
            },
            {
                display_name: _(`Can manage motion polls`),
                help_text: _(`Can create, modify, start/stop and delete votes.`),
                value: Permission.motionCanManagePolls
            }
        ]
    },
    {
        name: `Elections`,
        permissions: [
            {
                display_name: _(`Can see elections`),
                help_text: _(
                    `Can see assignments, including the list of candidates and results. Note: Voting rights are defined directly in the ballot.`
                ),
                value: Permission.assignmentCanSee
            },
            {
                display_name: _(`Can manage elections`),
                help_text: _(
                    `Can create, modify and delete assignments and candidate lists, as well as start/stop and reset ballots. `
                ),
                value: Permission.assignmentCanManage
            },
            {
                display_name: _(`Can nominate another participant`),
                help_text: _(`Can nominate other participants as candidates. Requirement: Can see participants.`),
                value: Permission.assignmentCanNominateOther
            },
            {
                display_name: _(`Can nominate oneself`),
                help_text: _(`Can add their name to the list of candidates in the "Search for candidates" phase.`),
                value: Permission.assignmentCanNominateSelf
            }
        ]
    },
    {
        name: `Participants`,
        permissions: [
            {
                display_name: _(`Can see participants`),
                help_text: _(
                    `Can see the following data of all participants: Personal data like Name, pronoun, gender. Event-specific information like Structure level, Group, Participant number, About me, Attendance status.`
                ),
                value: Permission.userCanSee
            },
            {
                display_name: _(`Can manage presence of others`),
                help_text: _(`Can change the attendance status of other participants.`),
                value: Permission.userCanManagePresence
            },
            {
                display_name: _(`Can manage participants`),
                help_text: _(`Can create, modify, delete participant records and edit group permissions.`),
                value: Permission.userCanManage
            }
        ]
    },
    {
        name: `Files`,
        permissions: [
            {
                display_name: _(`Can see the list of files`),
                help_text: _(`Can see the menu folder and all files shared with the group.`),
                value: Permission.mediafileCanSee
            },
            {
                display_name: _(`Can manage logos and fonts`),
                help_text: _(`Can activate and deactivate logos and fonts under > Files.`),
                value: Permission.meetingCanManageLogosAndFonts
            },
            {
                display_name: _(`Can manage files`),
                help_text: _(`Can upload, modify and delete files, create folders and change access restrictions.`),
                value: Permission.mediafileCanManage
            }
        ]
    },
    {
        name: `General`,
        permissions: [
            {
                display_name: _(`Can see the front page`),
                help_text: _(`Can see the start page.`),
                value: Permission.meetingCanSeeFrontpage
            },
            {
                display_name: _(`Can see the autopilot`),
                help_text: _(`Can see the autopilot, as well as all content for which permissions are defined.`),
                value: Permission.meetingCanSeeAutopilot
            },
            {
                display_name: _(`Can see the live stream`),
                help_text: _(`Can see the livestream when a > Livestream is defined under > Settings.`),
                value: Permission.meetingCanSeeLivestream
            },
            {
                display_name: _(`Can see history`),
                help_text: _(
                    `Can see the history of processing timestamps for motions, assignments and participants. Note: For privacy reasons, it is recommended to limit the rights to view the chronicle significantly.`
                ),
                value: Permission.meetingCanSeeHistory
            },
            {
                display_name: _(`Can manage settings`),
                help_text: _(`Can edit all settings and the start page of the event.`),
                value: Permission.meetingCanManageSettings
            },
            {
                display_name: _(`Can manage tags`),
                help_text: _(`Can create, change, delete keywords for the agenda and for motions.`),
                value: Permission.tagCanManage
            },
            {
                display_name: _(`Can manage the chat`),
                help_text: _(`Can create, modify, delete chat groups and define permissions.`),
                value: Permission.chatCanManage
            }
        ]
    }
];
