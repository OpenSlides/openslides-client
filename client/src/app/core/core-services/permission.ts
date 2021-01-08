/**
 * Permissions on the client are just strings. This makes clear, that
 * permissions instead of arbitrary strings should be given.
 */
export enum Permission {
    agendaItemCanManage = 'agenda_item.can_manage',
    agendaItemCanSee = 'agenda_item.can_see',
    agendaItemCanSeeInternalItems = 'agenda_item.can_see_internal',

    listOfSpeakersCanManage = 'list_of_speakers.can_manage',
    listOfSpeakersCanSee = 'list_of_speakers.can_see',
    listOfSpeakersCanBeSpeaker = 'list_of_speakers.can_be_speaker',

    assignmentsCanManage = 'assignment.can_manage',
    assignmentsCanNominateOther = 'assignment.can_nominate_other',
    assignmentsCanNominateSelf = 'assignment.can_nominate_self',
    assignmentsCanSee = 'assignment.can_see',

    meetingCanManageSettings = 'meeting.can_manage_settings',
    meetingCanManageLogosAndFonts = 'meeting.can_manage_logos_and_fonts',
    meetingCanSeeHistory = 'meeting.can_see_history',
    meetingCanSeeAutopilot = 'meeting.can_see_autopilot',
    meetingCanSeeFrontpage = 'meeting.can_see_frontpage',
    meetingCanSeeLiveStream = 'meeting.can_see_livestream',

    projectorCanSee = 'projector.can_see',
    projectorCanManage = 'projector.can_manage',

    tagsCanManage = 'tag.can_manage',

    mediafilesCanManage = 'mediafile.can_manage',
    mediafilesCanSee = 'mediafile.can_see',

    motionsCanCreate = 'motion.can_create',
    motionsCanCreateAmendments = 'motion.can_create_amendments',
    motionsCanManage = 'motion.can_manage',
    motionsCanManageMetadata = 'motion.can_manage_metadata',
    motionsCanManagePolls = 'motion.can_manage_polls',
    motionsCanSee = 'motion.can_see',
    motionsCanSeeInternal = 'motion.can_see_internal',
    motionsCanSupport = 'motion.can_support',

    usersCanChangeOwnPassword = 'user.can_change_own_password',
    usersCanManage = 'user.can_manage',
    usersCanSeeExtraData = 'user.can_see_extra_data',
    usersCanSee = 'user.can_see'
}

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
        name: 'Projector',
        permissions: [
            { display_name: 'Can see the projector', value: Permission.projectorCanSee },
            { display_name: 'Can manage the projector', value: Permission.projectorCanManage }
        ]
    },
    {
        name: 'Agenda',
        permissions: [
            { display_name: 'Can see agenda', value: Permission.agendaItemCanSee },
            {
                display_name: 'Can see internal items and time scheduling of agenda',
                value: Permission.agendaItemCanSeeInternalItems
            },
            { display_name: 'Can see list of speakers', value: Permission.listOfSpeakersCanSee },
            { display_name: 'Can manage agenda', value: Permission.agendaItemCanManage },
            { display_name: 'Can manage list of speakers', value: Permission.listOfSpeakersCanManage },
            { display_name: 'Can put oneself on the list of speakers', value: Permission.listOfSpeakersCanBeSpeaker }
        ]
    },
    {
        name: 'Motions',
        permissions: [
            { display_name: 'Can see motions', value: Permission.motionsCanSee },
            { display_name: 'Can see motions in internal state', value: Permission.motionsCanSeeInternal },
            { display_name: 'Can create motions', value: Permission.motionsCanCreate },
            { display_name: 'Can create amendments', value: Permission.motionsCanCreateAmendments },
            { display_name: 'Can support motions', value: Permission.motionsCanSupport },
            { display_name: 'Can manage motions', value: Permission.motionsCanManage },
            { display_name: 'Can manage motion metadata', value: Permission.motionsCanManageMetadata },
            { display_name: 'Can manage motion polls', value: Permission.motionsCanManagePolls }
        ]
    },
    {
        name: 'Elections',
        permissions: [
            { display_name: 'Can see elections', value: Permission.assignmentsCanSee },
            { display_name: 'Can manage elections', value: Permission.assignmentsCanManage },
            { display_name: 'Can nominate another participant', value: Permission.assignmentsCanNominateOther },
            { display_name: 'Can nominate oneself', value: Permission.assignmentsCanNominateSelf }
        ]
    },
    {
        name: 'Files',
        permissions: [
            { display_name: 'Can see the list of files', value: Permission.mediafilesCanSee },
            { display_name: 'Can manage files', value: Permission.mediafilesCanManage }
        ]
    },
    {
        name: 'Participants',
        permissions: [
            { display_name: 'Can see names of users', value: Permission.usersCanSee },
            {
                display_name: 'Can see extra data of users (e.g. email and comment)',
                value: Permission.usersCanSeeExtraData
            },
            { display_name: 'Can change its own password', value: Permission.usersCanChangeOwnPassword },
            { display_name: 'Can manage users', value: Permission.usersCanManage }
        ]
    },
    {
        name: 'General',
        permissions: [
            { display_name: 'Can see the front page', value: Permission.meetingCanSeeFrontpage },
            { display_name: 'Can see the autopilot', value: Permission.meetingCanSeeAutopilot },
            { display_name: 'Can see the live stream', value: Permission.meetingCanSeeLiveStream },
            { display_name: 'Can see history', value: Permission.meetingCanSeeHistory },
            { display_name: 'Can manage settings', value: Permission.meetingCanManageSettings },
            { display_name: 'Can manage logos and fonts', value: Permission.meetingCanManageLogosAndFonts },
            { display_name: 'Can manage tags', value: Permission.tagsCanManage }
        ]
    }
];
