import { Id } from 'src/app/domain/definitions/key-types';
import { UserFieldsets } from 'src/app/domain/fieldsets/user';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

export const MANDATE_CHECK_SUBSCRIPTION = `mandate-check`;

export const getMandateCheckSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        fieldset: [],
        ids: [id],
        follow: [
            {
                idField: `meeting_user_ids`,
                fieldset: [`group_ids`, `meeting_id`, `structure_level_ids`],
                follow: [
                    {
                        idField: `user_id`,
                        fieldset: UserFieldsets.FullNameSubscription.fieldset.concat(
                            `gender_id`,
                            `is_present_in_meeting_ids`
                        ),
                        follow: [
                            {
                                idField: `gender_id`,
                                fieldset: [`name`]
                            }
                        ]
                    }
                ]
            },
            {
                idField: `group_ids`,
                fieldset: [`name`, `meeting_user_ids`]
            },
            {
                idField: `structure_level_ids`,
                fieldset: [`name`, `meeting_user_ids`]
            }
        ]
    },
    subscriptionName: MANDATE_CHECK_SUBSCRIPTION
});
