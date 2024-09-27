import { BaseSimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

export class UserFieldsets {
    public static readonly FullNameSubscription: BaseSimplifiedModelRequest = {
        fieldset: [`title`, `first_name`, `last_name`, `pronoun`, `username`, `default_vote_weight`, `gender_id`]
    };
}

export class MeetingUserFieldsets {
    public static readonly FullNameSubscription: BaseSimplifiedModelRequest = {
        fieldset: [`group_ids`, `meeting_id`, `user_id`, `number`],
        follow: [
            { idField: `user_id`, ...UserFieldsets.FullNameSubscription },
            { idField: `structure_level_ids`, fieldset: [`name`] }
        ]
    };
}
