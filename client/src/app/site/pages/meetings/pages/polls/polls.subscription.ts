export const pollModelRequest = {
    follow: [
        { idField: `content_object_id` },
        { idField: `global_option_id` },
        {
            idField: `option_ids`,
            follow: [
                {
                    idField: `content_object_id`,
                    fieldset: [
                        `title`,
                        `pronoun`,
                        `first_name`,
                        `last_name`,
                        `username`,
                        { templateField: `number_$` },
                        { templateField: `structure_level_$` }
                    ]
                },
                `vote_ids`
            ],
            additionalFields: [`text`]
        }
    ]
};
