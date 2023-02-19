import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { Permission } from './permission';

export type PermissionsMap = { [key in Permission]?: Permission[] };

export interface DisplayPermission {
    display_name: string;
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
            { display_name: _(`Can see the projector`), value: Permission.projectorCanSee },
            { display_name: _(`Can manage the projector`), value: Permission.projectorCanManage }
        ]
    },
    {
        name: `Agenda`,
        permissions: [
            { display_name: _(`Can see agenda`), value: Permission.agendaItemCanSee },
            {
                display_name: _(`Can see internal items and time scheduling of agenda`),
                value: Permission.agendaItemCanSeeInternal
            },
            { display_name: _(`Can manage agenda`), value: Permission.agendaItemCanManage },
            { display_name: _(`Can see list of speakers`), value: Permission.listOfSpeakersCanSee },
            { display_name: _(`Can manage list of speakers`), value: Permission.listOfSpeakersCanManage },
            {
                display_name: _(`Can put oneself on the list of speakers`),
                value: Permission.listOfSpeakersCanBeSpeaker
            },
            { display_name: _(`Can manage polls`), value: Permission.pollCanManage }
        ]
    },
    {
        name: `Motions`,
        permissions: [
            { display_name: _(`Can see motions`), value: Permission.motionCanSee },
            { display_name: _(`Can see motions in internal state`), value: Permission.motionCanSeeInternal },
            { display_name: _(`Can create motions`), value: Permission.motionCanCreate },
            { display_name: _(`Can create amendments`), value: Permission.motionCanCreateAmendments },
            { display_name: _(`Can forward motions`), value: Permission.motionCanForward },
            { display_name: _(`Can support motions`), value: Permission.motionCanSupport },
            { display_name: _(`Can manage motions`), value: Permission.motionCanManage },
            { display_name: _(`Can manage motion metadata`), value: Permission.motionCanManageMetadata },
            { display_name: _(`Can manage motion polls`), value: Permission.motionCanManagePolls }
        ]
    },
    {
        name: `Elections`,
        permissions: [
            { display_name: _(`Can see elections`), value: Permission.assignmentCanSee },
            { display_name: _(`Can manage elections`), value: Permission.assignmentCanManage },
            { display_name: _(`Can nominate another participant`), value: Permission.assignmentCanNominateOther },
            { display_name: _(`Can nominate oneself`), value: Permission.assignmentCanNominateSelf }
        ]
    },
    {
        name: `Participants`,
        permissions: [
            { display_name: _(`Can see participants`), value: Permission.userCanSee },
            {
                display_name: _(`Can manage presence of others`),
                value: Permission.userCanManagePresence
            },
            { display_name: _(`Can manage participants`), value: Permission.userCanManage }
        ]
    },
    {
        name: `Files`,
        permissions: [
            { display_name: _(`Can see the list of files`), value: Permission.mediafileCanSee },
            { display_name: _(`Can manage files`), value: Permission.mediafileCanManage }
        ]
    },
    {
        name: `General`,
        permissions: [
            { display_name: _(`Can see the front page`), value: Permission.meetingCanSeeFrontpage },
            { display_name: _(`Can see the autopilot`), value: Permission.meetingCanSeeAutopilot },
            { display_name: _(`Can see the live stream`), value: Permission.meetingCanSeeLivestream },
            { display_name: _(`Can see history`), value: Permission.meetingCanSeeHistory },
            { display_name: _(`Can manage settings`), value: Permission.meetingCanManageSettings },
            { display_name: _(`Can manage logos and fonts`), value: Permission.meetingCanManageLogosAndFonts },
            { display_name: _(`Can manage tags`), value: Permission.tagCanManage },
            { display_name: _(`Can manage the chat`), value: Permission.chatCanManage }
        ]
    }
];
