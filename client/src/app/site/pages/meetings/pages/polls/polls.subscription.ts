export const pollModelRequest = {
    follow: [
        { idField: `content_object_id` },
        { idField: `global_option_id` },
        {
            idField: `option_ids`,
            follow: [`content_object_id`, `vote_ids`],
            additionalFields: [`text`]
        }
    ]
};
