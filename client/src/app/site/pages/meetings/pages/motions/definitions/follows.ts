import { UserFieldsets } from 'src/app/domain/fieldsets/user';
import { Follow } from 'src/app/site/services/model-request-builder';

export const GET_POSSIBLE_RECOMMENDATIONS: Follow = {
    idField: `workflow_id`,
    follow: [
        {
            idField: `state_ids`,
            fieldset: `title`,
            additionalFields: [`weight`, `recommendation_label`, `show_recommendation_extension_field`]
        }
    ]
};

export const SUBMITTER_FOLLOW: Follow = {
    idField: `submitter_ids`,
    follow: [
        {
            idField: `user_id`,
            ...UserFieldsets.ShortNameSubscription
        }
    ]
};
