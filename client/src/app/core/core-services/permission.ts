/**
 * Permissions on the client are just strings. This makes clear, that
 * permissions instead of arbitrary strings should be given.
 */
export enum Permission {
    agendaCanManage = 'agenda.can_manage',
    agendaCanSee = 'agenda.can_see',
    agendaCanSeeInternalItems = 'agenda.can_see_internal_items',
    agendaCanManageListOfSpeakers = 'agenda.can_manage_list_of_speakers',
    agendaCanSeeListOfSpeakers = 'agenda.can_see_list_of_speakers',
    agendaCanBeSpeaker = 'agenda.can_be_speaker',

    assignmentsCanManage = 'assignments.can_manage',
    assignmentsCanNominateOther = 'assignments.can_nominate_other',
    assignmentsCanNominateSelf = 'assignments.can_nominate_self',
    assignmentsCanSee = 'assignments.can_see',

    coreCanManageSettings = 'core.can_manage_settings',
    coreCanManageLogosAndFonts = 'core.can_manage_logos_and_fonts',
    coreCanSeeHistory = 'core.can_see_history',
    coreCanManageProjector = 'core.can_manage_projector',
    coreCanSeeFrontpage = 'core.can_see_frontpage',
    coreCanSeeProjector = 'core.can_see_projector',
    coreCanManageTags = 'core.can_manage_tags',
    coreCanSeeLiveStream = 'core.can_see_livestream',
    coreCanSeeAutopilot = 'core.can_see_autopilot',

    mediafilesCanManage = 'mediafiles.can_manage',
    mediafilesCanSee = 'mediafiles.can_see',

    motionsCanCreate = 'motions.can_create',
    motionsCanCreateAmendments = 'motions.can_create_amendments',
    motionsCanManage = 'motions.can_manage',
    motionsCanManageMetadata = 'motions.can_manage_metadata',
    motionsCanManagePolls = 'motions.can_manage_polls',
    motionsCanSee = 'motions.can_see',
    motionsCanSeeInternal = 'motions.can_see_internal',
    motionsCanSupport = 'motions.can_support',

    usersCanChangePassword = 'users.can_change_password',
    usersCanManage = 'users.can_manage',
    usersCanSeeExtraData = 'users.can_see_extra_data',
    usersCanSeeName = 'users.can_see_name'
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
            { display_name: 'Can see the projector', value: Permission.coreCanSeeProjector },
            { display_name: 'Can manage the projector', value: Permission.coreCanManageProjector }
        ]
    },
    {
        name: 'Agenda',
        permissions: [
            { display_name: 'Can see agenda', value: Permission.agendaCanSee },
            {
                display_name: 'Can see internal items and time scheduling of agenda',
                value: Permission.agendaCanSeeInternalItems
            },
            { display_name: 'Can see list of speakers', value: Permission.agendaCanSeeListOfSpeakers },
            { display_name: 'Can manage agenda', value: Permission.agendaCanManage },
            { display_name: 'Can manage list of speakers', value: Permission.agendaCanManageListOfSpeakers },
            { display_name: 'Can put oneself on the list of speakers', value: Permission.agendaCanBeSpeaker }
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
            { display_name: 'Can see names of users', value: Permission.usersCanSeeName },
            {
                display_name: 'Can see extra data of users (e.g. email and comment)',
                value: Permission.usersCanSeeExtraData
            },
            { display_name: 'Can change its own password', value: Permission.usersCanChangePassword },
            { display_name: 'Can manage users', value: Permission.usersCanManage }
        ]
    },
    {
        name: 'General',
        permissions: [
            { display_name: 'Can see the front page', value: Permission.coreCanSeeFrontpage },
            { display_name: 'Can see the autopilot', value: Permission.coreCanSeeAutopilot },
            { display_name: 'Can see the live stream', value: Permission.coreCanSeeLiveStream },
            { display_name: 'Can see history', value: Permission.coreCanSeeHistory },
            { display_name: 'Can manage settings', value: Permission.coreCanManageSettings },
            { display_name: 'Can manage logos and fonts', value: Permission.coreCanManageLogosAndFonts },
            { display_name: 'Can manage tags', value: Permission.coreCanManageTags }
        ]
    }
];
