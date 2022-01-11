/**
 * Permissions on the client are just strings. This makes clear, that
 * permissions instead of arbitrary strings should be given.
 */
export enum Permission {
    agendaItemCanManage = `agenda_item.can_manage`,
    agendaItemCanSee = `agenda_item.can_see`,
    agendaItemCanSeeInternal = `agenda_item.can_see_internal`,

    assignmentCanManage = `assignment.can_manage`,
    assignmentCanNominateOther = `assignment.can_nominate_other`,
    assignmentCanNominateSelf = `assignment.can_nominate_self`,
    assignmentCanSee = `assignment.can_see`,

    chatCanManage = `chat.can_manage`,

    listOfSpeakersCanManage = `list_of_speakers.can_manage`,
    listOfSpeakersCanSee = `list_of_speakers.can_see`,
    listOfSpeakersCanBeSpeaker = `list_of_speakers.can_be_speaker`,

    mediafileCanManage = `mediafile.can_manage`,
    mediafileCanSee = `mediafile.can_see`,

    meetingCanManageSettings = `meeting.can_manage_settings`,
    meetingCanManageLogosAndFonts = `meeting.can_manage_logos_and_fonts`,
    meetingCanSeeFrontpage = `meeting.can_see_frontpage`,
    meetingCanSeeAutopilot = `meeting.can_see_autopilot`,
    meetingCanSeeLiveStream = `meeting.can_see_livestream`,
    meetingCanSeeHistory = `meeting.can_see_history`,

    motionCanCreate = `motion.can_create`,
    motionCanCreateAmendments = `motion.can_create_amendments`,
    motionCanForwardIntoThisMeeting = `motion.can_forward_into_this_meeting`,
    motionCanManage = `motion.can_manage`,
    motionCanManageMetadata = `motion.can_manage_metadata`,
    motionCanManagePolls = `motion.can_manage_polls`,
    motionCanSee = `motion.can_see`,
    motionCanSeeInternal = `motion.can_see_internal`,
    motionCanSupport = `motion.can_support`,

    pollCanManage = `poll.can_manage`,

    projectorCanSee = `projector.can_see`,
    projectorCanManage = `projector.can_manage`,

    tagCanManage = `tag.can_manage`,

    userCanManage = `user.can_manage`,
    userCanManagePresence = `user.can_manage_presence`,
    userCanSee = `user.can_see`
}

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
            {
                display_name: `Can forward motions into this meeting`,
                value: Permission.motionCanForwardIntoThisMeeting
            },
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
        name: `Files`,
        permissions: [
            { display_name: `Can see the list of files`, value: Permission.mediafileCanSee },
            { display_name: `Can manage files`, value: Permission.mediafileCanManage }
        ]
    },
    {
        name: `Participants`,
        permissions: [
            { display_name: `Can see names of users`, value: Permission.userCanSee },
            {
                display_name: `Can manage other users presence state`,
                value: Permission.userCanManagePresence
            },
            { display_name: `Can manage users`, value: Permission.userCanManage }
        ]
    },
    {
        name: `General`,
        permissions: [
            { display_name: `Can see the front page`, value: Permission.meetingCanSeeFrontpage },
            { display_name: `Can see the autopilot`, value: Permission.meetingCanSeeAutopilot },
            { display_name: `Can see the live stream`, value: Permission.meetingCanSeeLiveStream },
            // { display_name: `Can see history`, value: Permission.meetingCanSeeHistory },
            { display_name: `Can manage settings`, value: Permission.meetingCanManageSettings },
            { display_name: `Can manage logos and fonts`, value: Permission.meetingCanManageLogosAndFonts },
            { display_name: `Can manage tags`, value: Permission.tagCanManage },
            { display_name: `Can manage the chat`, value: Permission.chatCanManage }
        ]
    }
];
