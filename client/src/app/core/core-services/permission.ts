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
