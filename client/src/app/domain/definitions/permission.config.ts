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
            { display_name: `Can see the projector`, value: Permission.projectorCanSee },
            { display_name: `Can manage the projector`, value: Permission.projectorCanManage }
        ]
    },
    {
        name: `Agenda`,
        permissions: [
            { display_name: `Can see agenda`, value: Permission.agendaItemCanSee },
            {
                display_name: `Can see internal items and time scheduling of agenda`,
                value: Permission.agendaItemCanSeeInternal
            },
            { display_name: `Can manage agenda`, value: Permission.agendaItemCanManage },
            { display_name: `Can see list of speakers`, value: Permission.listOfSpeakersCanSee },
            { display_name: `Can manage list of speakers`, value: Permission.listOfSpeakersCanManage },
            { display_name: `Can put oneself on the list of speakers`, value: Permission.listOfSpeakersCanBeSpeaker },
            { display_name: `Can manage polls`, value: Permission.pollCanManage }
        ]
    },
    {
        name: `Motions`,
        permissions: [
            { display_name: `Can see motions`, value: Permission.motionCanSee },
            { display_name: `Can see motions in internal state`, value: Permission.motionCanSeeInternal },
            { display_name: `Can create motions`, value: Permission.motionCanCreate },
            { display_name: `Can create amendments`, value: Permission.motionCanCreateAmendments },
            { display_name: `Can forward motions`, value: Permission.motionCanForward },
            { display_name: `Can support motions`, value: Permission.motionCanSupport },
            { display_name: `Can manage motions`, value: Permission.motionCanManage },
            { display_name: `Can manage motion metadata`, value: Permission.motionCanManageMetadata },
            { display_name: `Can manage motion polls`, value: Permission.motionCanManagePolls }
        ]
    },
    {
        name: `Elections`,
        permissions: [
            { display_name: `Can see elections`, value: Permission.assignmentCanSee },
            { display_name: `Can manage elections`, value: Permission.assignmentCanManage },
            { display_name: `Can nominate another participant`, value: Permission.assignmentCanNominateOther },
            { display_name: `Can nominate oneself`, value: Permission.assignmentCanNominateSelf }
        ]
    },
    {
        name: `Participants`,
        permissions: [
            { display_name: `Can see participants`, value: Permission.userCanSee },
            {
                display_name: `Can manage presence of others`,
                value: Permission.userCanManagePresence
            },
            { display_name: `Can manage participants`, value: Permission.userCanManage }
        ]
    },
    {
        name: `Files`,
        permissions: [
            { display_name: `Can see the list of files`, value: Permission.mediafileCanSee },
            { display_name: `Can manage files`, value: Permission.mediafileCanManage }
        ]
    },
    {
        name: `General`,
        permissions: [
            { display_name: `Can see the front page`, value: Permission.meetingCanSeeFrontpage },
            { display_name: `Can see the autopilot`, value: Permission.meetingCanSeeAutopilot },
            { display_name: `Can see the live stream`, value: Permission.meetingCanSeeLivestream },
            { display_name: `Can see history`, value: Permission.meetingCanSeeHistory },
            { display_name: `Can manage settings`, value: Permission.meetingCanManageSettings },
            { display_name: `Can manage logos and fonts`, value: Permission.meetingCanManageLogosAndFonts },
            { display_name: `Can manage tags`, value: Permission.tagCanManage },
            { display_name: `Can manage the chat`, value: Permission.chatCanManage }
        ]
    }
];
