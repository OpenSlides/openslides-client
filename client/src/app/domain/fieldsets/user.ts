import { BaseSimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

export class UserFieldsets {
    public static readonly ShortNameSubscription: BaseSimplifiedModelRequest = {
        fieldset: [
            `title`,
            `first_name`,
            `last_name`,
            `pronoun`,
            `username`,
            `gender`,
            `default_number`,
            `default_structure_level`,
            `default_vote_weight`,
            { templateField: `number_$` },
            { templateField: `structure_level_$` }
        ]
    };
}
