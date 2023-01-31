// THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.
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

    listOfSpeakersCanBeSpeaker = `list_of_speakers.can_be_speaker`,
    listOfSpeakersCanManage = `list_of_speakers.can_manage`,
    listOfSpeakersCanSee = `list_of_speakers.can_see`,

    mediafileCanManage = `mediafile.can_manage`,
    mediafileCanSee = `mediafile.can_see`,

    meetingCanManageLogosAndFonts = `meeting.can_manage_logos_and_fonts`,
    meetingCanManageSettings = `meeting.can_manage_settings`,
    meetingCanSeeAutopilot = `meeting.can_see_autopilot`,
    meetingCanSeeFrontpage = `meeting.can_see_frontpage`,
    meetingCanSeeHistory = `meeting.can_see_history`,
    meetingCanSeeLivestream = `meeting.can_see_livestream`,

    motionCanCreate = `motion.can_create`,
    motionCanCreateAmendments = `motion.can_create_amendments`,
    motionCanForward = `motion.can_forward`,
    motionCanManage = `motion.can_manage`,
    motionCanManageMetadata = `motion.can_manage_metadata`,
    motionCanManagePolls = `motion.can_manage_polls`,
    motionCanSee = `motion.can_see`,
    motionCanSeeInternal = `motion.can_see_internal`,
    motionCanSupport = `motion.can_support`,

    pollCanManage = `poll.can_manage`,

    projectorCanManage = `projector.can_manage`,
    projectorCanSee = `projector.can_see`,

    tagCanManage = `tag.can_manage`,

    userCanManage = `user.can_manage`,
    userCanManagePresence = `user.can_manage_presence`,
    userCanSee = `user.can_see`
}
