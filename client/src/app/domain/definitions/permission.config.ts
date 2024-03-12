import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

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
                display_name: _(`Can see the autopilot`),
                help_text: _(
                    `Can see the Autopilot menu item with all content for which appropriate permissions are set.`
                ),
                value: Permission.meetingCanSeeAutopilot
            },
            {
                display_name: _(`Can see the projector`),
                help_text: _(
                    `Can see the Projector menu item and all projectors (in the Autopilot as well as in the Projector menu item)`
                ),
                value: Permission.projectorCanSee
            },
            {
                display_name: _(`Can manage the projector`),
                help_text: _(`Can create, configure, control and delete projectors.`),
                value: Permission.projectorCanManage
            }
        ]
    },
    {
        name: `Agenda`,
        permissions: [
            {
                display_name: _(`Can see agenda`),
                help_text: _(`Can see the Agenda menu item and all public topics in the agenda.`),
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
                    `Can create, modify and delete topics, add motions and elections to the agenda, sort, number and tag agenda items.`
                ),
                value: Permission.agendaItemCanManage
            },
            {
                display_name: _(`Can see list of speakers`),
                help_text: _(`Can see all lists of speakers`),
                value: Permission.listOfSpeakersCanSee
            },
            {
                display_name: _(`Can manage list of speakers`),
                help_text: _(
                    `Can add or delete speakers to or from the list of speakers, mark, sort, start/stop and open/close the list of speakers.`
                ),
                value: Permission.listOfSpeakersCanManage
            },
            {
                display_name: _(`Can put oneself on the list of speakers`),
                help_text: _(`Is allowed to add himself/herself to the list of speakers. 

Note:
Optional combination of requests to speak with presence status is possible. ( > [Settings] > [List of speakers] > [General] )`),
                value: Permission.listOfSpeakersCanBeSpeaker
            },
            {
                display_name: _(`Can manage polls`),
                help_text: _(`Can create, change, start/stop and delete polls.`),
                value: Permission.pollCanManage
            },
            {
                display_name: _(`Can see moderation notes`),
                help_text: _(`Can see all moderation notes in each list of speakers.`),
                value: Permission.agendaItemCanSeeModeratorNotes
            },
            {
                display_name: _(`Can manage moderation notes`),
                help_text: _(`Can edit all moderation notes.`),
                value: Permission.agendaItemCanManageModeratorNotes
            }
        ]
    },
    {
        name: `Motions`,
        permissions: [
            {
                display_name: _(`Can see motions`),
                help_text: _(
                    `Can see the Motions menu item and all motions unless they are limited by access restrictions in the workflow.`
                ),
                value: Permission.motionCanSee
            },
            {
                display_name: _(`Can see motions in internal state`),
                help_text: _(
                    `Can see motions in the internal state that are limited in the workflow under Restrictions with the same description.

Tip: Cross-check desired visibility of motions with test delegate account. `
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
                    `Can forward motions to other meetings within the OpenSlides instance. 

Further requirements:
1. forwarding hierarchy must be set at the organizational level in the committee. 
2. target meeting must be created.
3. forwarding must be activated in the workflow in the state.`
                ),
                value: Permission.motionCanForward
            },
            {
                display_name: _(`Can support motions`),
                help_text: _(
                    `Can support motions. The support function must be enabled in > [Settings] > [Motions] as well as for the corresponding state in > [Workflow].`
                ),
                value: Permission.motionCanSupport
            },
            {
                display_name: _(`Can manage motions`),
                help_text: _(
                    `Can create, modify and delete motions and votings, amendments and change recommendations, and edit the metadata of a motion. Including the management of categories, motion blocks, tags, workflows and comment fields.`
                ),
                value: Permission.motionCanManage
            },
            {
                display_name: _(`Can manage motion metadata`),
                help_text: _(
                    `Can edit and assign the following motion metadata: Submitter, state, recommendation, category, motion blocks and tags.`
                ),
                value: Permission.motionCanManageMetadata
            },
            {
                display_name: _(`Can manage motion polls`),
                help_text: _(`Can create, modify, start/stop and delete votings.`),
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
                    `Can see the menu item Elections, including the list of candidates and results. 

Note: The right to vote is defined directly in the ballot.`
                ),
                value: Permission.assignmentCanSee
            },
            {
                display_name: _(`Can manage elections`),
                help_text: _(
                    `Can create, modify and delete elections and candidate lists, as well as start/stop and reset ballots. `
                ),
                value: Permission.assignmentCanManage
            },
            {
                display_name: _(`Can nominate another participant`),
                help_text: _(`Can nominate other participants as candidates. 

Requires group permission: [Can see participants]`),
                value: Permission.assignmentCanNominateOther
            },
            {
                display_name: _(`Can nominate oneself`),
                help_text: _(`Can add their name to the list of candidates in the [Search for candidates] phase.`),
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
                    `Can see the menu item Participants and therefore the following data from all participants: 
Personal data: Name, pronoun, gender. 
Meeting specific information: Structure level, Group, Participant number, About me, Presence status.`
                ),
                value: Permission.userCanSee
            },
            {
                display_name: _(`Can manage presence of others`),
                help_text: _(`Can change the presence status of other participants.`),
                value: Permission.userCanManagePresence
            },
            {
                display_name: _(`Can manage participants`),
                help_text: _(`Can create, modify, delete participant datasets and administrate group permissions.`),
                value: Permission.userCanManage
            }
        ]
    },
    {
        name: `Files`,
        permissions: [
            {
                display_name: _(`Can see files`),
                help_text: _(`Can see the Files menu item and all shared folders and files.

Note: Sharing of folders and files may be restricted by group assignment.`),
                value: Permission.mediafileCanSee
            },
            {
                display_name: _(`Can manage files`),
                help_text: _(
                    `Can upload, modify and delete files, administrate folders and change access restrictions.`
                ),
                value: Permission.mediafileCanManage
            },
            {
                display_name: _(`Can manage logos and fonts`),
                help_text: _(`Can activate and deactivate logos and fonts under > [Files].`),
                value: Permission.meetingCanManageLogosAndFonts
            }
        ]
    },
    {
        name: `General`,
        permissions: [
            {
                display_name: _(`Can see the front page`),
                help_text: _(`Can see the Home menu item.`),
                value: Permission.meetingCanSeeFrontpage
            },
            {
                display_name: _(`Can see the live stream`),
                help_text: _(
                    `Can see the livestream if there is a livestream URL entered in > [Settings] > [Livestream].`
                ),
                value: Permission.meetingCanSeeLivestream
            },
            {
                display_name: _(`Can see history`),
                help_text: _(
                    `Can see the History menu item with the history of processing timestamps for motions, elections and participants. 

Note: For privacy reasons, it is recommended to limit the rights to view the History significantly.`
                ),
                value: Permission.meetingCanSeeHistory
            },
            {
                display_name: _(`Can manage settings`),
                help_text: _(
                    `Can see the Settings menu item and edit all settings as well as the start page of the meeting.`
                ),
                value: Permission.meetingCanManageSettings
            },
            {
                display_name: _(`Can manage tags`),
                help_text: _(`Can create, change, delete tags for the agenda and for motions.`),
                value: Permission.tagCanManage
            },
            {
                display_name: _(`Can manage the chat`),
                help_text: _(`Can create, modify, delete chat groups and define permissions.

Note: The chat menu item becomes visible to all participants, except admins, as soon as a chat has been created.`),
                value: Permission.chatCanManage
            }
        ]
    }
];
