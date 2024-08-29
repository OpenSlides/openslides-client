import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ViewMeeting } from '../../view-models/view-meeting';

import { FULL_FIELDSET } from 'src/app/domain/fieldsets/misc';

export const MEDIAFILES_SUBSCRIPTION = `mediafiles_list`;
export const MEDIAFILES_LIST_MINIMAL_SUBSCRIPTION = `mediafiles_list_minimal`;

export const getMediafilesSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            { idField: `mediafile_ids` },
            { idField: `meeting_mediafile_ids` },
            {
                idField: `committee_id`,
                follow: [
                    {
                        idField: `organization_id`,
                        follow: [
                            {
                                idField: `published_mediafile_ids`,
                                fieldset: FULL_FIELDSET
                            }
                        ]
                    }
                ]
            }
        ]
    },
    subscriptionName: MEDIAFILES_SUBSCRIPTION
});

export const getMediafilesListMinimalSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`mediafile_ids`, `meeting_mediafile_ids`]
    },
    subscriptionName: MEDIAFILES_LIST_MINIMAL_SUBSCRIPTION
});
