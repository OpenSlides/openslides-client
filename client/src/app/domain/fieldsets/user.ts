import { BaseSimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

export class UserFieldsets {
    public static readonly FullNameSubscription: BaseSimplifiedModelRequest = {
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
            `number`,
            `structure_level`
        ]
    };
}
