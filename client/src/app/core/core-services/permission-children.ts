// THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.

import { Permission, PermissionsMap } from './permission';

export const childPermissions: PermissionsMap = {
    'agenda_item.can_see': [],
    'agenda_item.can_see_internal': [Permission.agendaItemCanSee],
    'agenda_item.can_manage': [Permission.agendaItemCanSeeInternal, Permission.agendaItemCanSee],
    'assignment.can_see': [],
    'assignment.can_nominate_other': [Permission.assignmentCanSee],
    'assignment.can_manage': [Permission.assignmentCanNominateOther, Permission.assignmentCanSee],
    'assignment.can_nominate_self': [Permission.assignmentCanSee],
    'chat.can_manage': [],
    'list_of_speakers.can_see': [],
    'list_of_speakers.can_manage': [Permission.listOfSpeakersCanSee],
    'list_of_speakers.can_be_speaker': [Permission.listOfSpeakersCanSee],
    'mediafile.can_see': [],
    'mediafile.can_manage': [Permission.mediafileCanSee],
    'meeting.can_manage_settings': [],
    'meeting.can_manage_logos_and_fonts': [],
    'meeting.can_see_frontpage': [],
    'meeting.can_see_autopilot': [],
    'meeting.can_see_livestream': [],
    'meeting.can_see_history': [],
    'motion.can_see': [],
    'motion.can_manage_metadata': [Permission.motionCanSee],
    'motion.can_manage_polls': [Permission.motionCanSee],
    'motion.can_see_internal': [Permission.motionCanSee],
    'motion.can_create': [Permission.motionCanSee],
    'motion.can_create_amendments': [Permission.motionCanSee],
    'motion.can_manage': [
        Permission.motionCanManageMetadata,
        Permission.motionCanSee,
        Permission.motionCanManagePolls,
        Permission.motionCanSeeInternal,
        Permission.motionCanCreate,
        Permission.motionCanCreateAmendments
    ],
    'motion.can_support': [Permission.motionCanSee],
    'poll.can_manage': [],
    'projector.can_see': [],
    'projector.can_manage': [Permission.projectorCanSee],
    'tag.can_manage': [],
    'user.can_see': [],
    'user.can_see_extra_data': [Permission.userCanSee],
    'user.can_manage': [Permission.userCanSeeExtraData, Permission.userCanSee]
};
