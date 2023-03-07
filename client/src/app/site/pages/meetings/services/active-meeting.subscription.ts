import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewMeeting } from '../view-models/view-meeting';

export const ACTIVE_MEETING_SUBSCRIPTION = `active_meeting`;

export const getActiveMeetingSubscriptionConfig = (
    id: Id,
    getNextMeetingIdObservable: () => Observable<Id | null>
) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        fieldset: DEFAULT_FIELDSET,
        follow: [
            `chat_group_ids`,
            `chat_message_ids`,
            {
                idField: `poll_ids`,
                follow: [{ idField: `content_object_id`, fieldset: [`title`] }],
                fieldset: [`title`, `state`, `entitled_group_ids`]
            },
            `group_ids`,
            // { idField: `option_ids`, follow: [`content_object_id`], additionalFields: [`text`] },
            // `vote_ids`,
            { idField: `committee_id`, additionalFields: [`name`] }
        ],
        additionalFields: [`jitsi_domain`, `jitsi_room_name`, `jitsi_room_password`]
    },
    subscriptionName: ACTIVE_MEETING_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

/*
import { ORGANIZATION_ID } from '../../organization/services/organization.service';
import { ViewOrganization } from '../../organization/view-models/view-organization';
import { getParticipantMinimalSubscriptionConfig } from '../pages/participants/config/model-subscription';
import { getProjectorListSubscriptionConfig } from '../pages/projectors/config/model-subscription';

const MEETING_DETAIL_GROUP_SUBSCRIPTION = `meeting_detail_group`; // Used for the active meeting service
const MEETING_DETAIL_MEDIAFILES_SUBSCRIPTION = `meeting_detail_mediafiles`;

const getMediafilesSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`mediafile_ids`]
    },
    subscriptionName: MEETING_DETAIL_MEDIAFILES_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

const getGeneralMediafilesSubscriptionConfig = (getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [{ idField: `mediafile_ids`, fieldset: `organizationDetail` }]
    },
    subscriptionName: MEETING_DETAIL_MEDIAFILES_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

const getMeetingDetailGroupSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        fieldset: `group`,
        follow: [`group_ids`]
    },
    subscriptionName: MEETING_DETAIL_GROUP_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id)),
    isDelayed: false
});
*/
