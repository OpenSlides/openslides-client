import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET } from 'src/app/domain/fieldsets/misc';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ViewMeeting } from '../../view-models/view-meeting';

export const MEDIAFILES_SUBSCRIPTION = `mediafiles_list`;
export const MEDIAFILES_LIST_MINIMAL_SUBSCRIPTION = `mediafiles_list_minimal`;

export const getMediafilesSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            { idField: `mediafile_ids`, fieldset: FULL_FIELDSET },
            {
                idField: `meeting_mediafile_ids`,
                fieldset: FULL_FIELDSET,
                follow: [{ idField: `mediafile_id`, fieldset: FULL_FIELDSET }]
            },
            {
                idField: `committee_id`,
                fieldset: [],
                follow: [
                    {
                        idField: `organization_id`,
                        fieldset: [],
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
        fieldset: FULL_FIELDSET,
        follow: [
            { idField: `mediafile_ids`, fieldset: [`id`, `owner_id`, `title`, `filename`] },
            { idField: `meeting_mediafile_ids`, fieldset: [] }
        ]
    },
    subscriptionName: MEDIAFILES_LIST_MINIMAL_SUBSCRIPTION
});
