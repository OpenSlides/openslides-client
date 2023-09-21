import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET } from 'src/app/domain/fieldsets/misc';
import { MeetingUserFieldsets, UserFieldsets } from 'src/app/domain/fieldsets/user';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { listOfSpeakersSpeakerCountSubscription } from '../agenda/agenda.subscription';
import { pollModelRequest } from '../polls/polls.subscription';
import { ViewMotionWorkflow } from './modules';
import { ViewMotion } from './view-models';

export const MOTION_LIST_SUBSCRIPTION = `motion_list`;
export const MOTION_LIST_MINIMAL_SUBSCRIPTION = `motion_list_minimal`;
export const MOTION_BLOCK_SUBSCRIPTION = `motion_block_list`;
export const MOTION_SUBMODELS_SUBSCRIPTION = `motion_submodel_list`;

export const getMotionListSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `motion_ids`,
                fieldset: [
                    `agenda_item_id`,
                    `all_derived_motion_ids`,
                    `all_origin_ids`,
                    `amendment_ids`,
                    `block_id`,
                    `category_id`,
                    `category_weight`,
                    `change_recommendation_ids`,
                    `comment_ids`,
                    `attachment_ids`,
                    `created`,
                    `derived_motion_ids`,
                    `forwarded`,
                    `last_modified`,
                    `lead_motion_id`,
                    `list_of_speakers_id`,
                    `meeting_id`,
                    `number`,
                    `origin_id`,
                    `origin_meeting_id`,
                    `personal_note_ids`,
                    `recommendation_extension`,
                    `recommendation_extension_reference_ids`,
                    `recommendation_id`,
                    `referenced_in_motion_recommendation_extension_ids`,
                    `sequential_number`,
                    `sort_parent_id`,
                    `sort_weight`,
                    `start_line_number`,
                    `state_extension`,
                    `state_extension_reference_ids`,
                    `state_id`,
                    `submitter_ids`,
                    `tag_ids`,
                    `title`
                ],
                follow: [
                    { idField: `list_of_speakers_id`, ...listOfSpeakersSpeakerCountSubscription },
                    { idField: `personal_note_ids`, fieldset: FULL_FIELDSET },
                    {
                        idField: `submitter_ids`,
                        fieldset: FULL_FIELDSET,
                        follow: [
                            {
                                idField: `meeting_user_id`,
                                follow: [
                                    {
                                        idField: `user_id`,
                                        fieldset: [...UserFieldsets.FullNameSubscription.fieldset, `meeting_user_ids`]
                                    }
                                ],
                                ...MeetingUserFieldsets.FullNameSubscription
                            }
                        ]
                    }
                ]
            }
        ]
    },
    subscriptionName: MOTION_LIST_SUBSCRIPTION
});

export const getMotionBlockSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `motion_block_ids`,
                fieldset: FULL_FIELDSET,
                follow: [{ idField: `list_of_speakers_id`, ...listOfSpeakersSpeakerCountSubscription }]
            }
        ]
    },
    subscriptionName: MOTION_BLOCK_SUBSCRIPTION
});

export const MOTION_WORKFLOW_SUBSCRIPTION = `motion_workflow_list`;

export const getMotionWorkflowSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `motion_workflow_ids`, fieldset: FULL_FIELDSET }]
    },
    subscriptionName: MOTION_WORKFLOW_SUBSCRIPTION
});

export const MOTION_WORKFLOW_DETAIL_SUBSCRIPTION = `motion_workflow_detail`;
export const getMotionWorkflowDetailSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        ids: [id],
        viewModelCtor: ViewMotionWorkflow,
        follow: [
            {
                idField: `state_ids`
            }
        ],
        fieldset: ``
    },
    subscriptionName: MOTION_WORKFLOW_DETAIL_SUBSCRIPTION
});

export const getMotionsSubmodelSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            { idField: `motion_category_ids`, fieldset: FULL_FIELDSET },
            { idField: `motion_state_ids`, fieldset: FULL_FIELDSET },
            { idField: `motion_comment_ids`, fieldset: [`meeting_id`, `motion_id`, `section_id`] },
            {
                idField: `motion_comment_section_ids`,
                fieldset: [
                    `meeting_id`,
                    `name`,
                    `sequential_number`,
                    `submitter_can_write`,
                    `weight`,
                    `read_group_ids`,
                    `write_group_ids`
                ]
            },
            { idField: `motion_statute_paragraph_ids`, fieldset: FULL_FIELDSET },
            { idField: `tag_ids`, fieldset: [`name`, `meeting_id`] }
        ]
    },
    subscriptionName: MOTION_SUBMODELS_SUBSCRIPTION
});

export const MOTION_ADDITIONAL_DETAIL_SUBSCRIPTION = `motion_additional_detail`;

export const getMotionAdditionalDetailSubscriptionConfig: SubscriptionConfigGenerator = (...ids: Id[]) => ({
    modelRequest: {
        ids,
        viewModelCtor: ViewMotion,
        fieldset: [`forwarded`, `created`, `sequential_number`],
        follow: [{ idField: `meeting_id`, fieldset: [`name`, `description`] }]
    },
    subscriptionName: MOTION_ADDITIONAL_DETAIL_SUBSCRIPTION
});

export const MOTION_DETAIL_SUBSCRIPTION = `motion_detail`;

export const getMotionDetailSubscriptionConfig: SubscriptionConfigGenerator = (...ids: Id[]) => ({
    modelRequest: {
        ids,
        viewModelCtor: ViewMotion,
        follow: [
            {
                idField: `poll_ids`,
                ...pollModelRequest
            },
            {
                idField: `attachment_ids`,
                fieldset: FULL_FIELDSET
            },
            { idField: `change_recommendation_ids`, fieldset: FULL_FIELDSET },
            { idField: `lead_motion_id`, fieldset: [`text`] },
            {
                idField: `amendment_ids`,
                fieldset: [`text`, `modified_final_version`, `amendment_paragraphs`],
                follow: [{ idField: `change_recommendation_ids`, fieldset: FULL_FIELDSET }]
            },
            { idField: `comment_ids`, fieldset: FULL_FIELDSET },
            {
                idField: `supporter_meeting_user_ids`,
                follow: [{ idField: `user_id`, ...UserFieldsets.FullNameSubscription }]
            }
        ],
        fieldset: [
            `workflow_timestamp`,
            `reason`,
            `text`,
            `modified_final_version`,
            `all_origin_ids`,
            `origin_meeting_id`,
            `derived_motion_ids`,
            `amendment_ids`,
            `amendment_paragraphs`
        ]
    },
    subscriptionName: MOTION_DETAIL_SUBSCRIPTION
});

export const getMotionListMinimalSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `motion_ids`, fieldset: [`title`, `meeting_id`, `sequential_number`] }]
    },
    subscriptionName: MOTION_LIST_MINIMAL_SUBSCRIPTION
});

export const AMENDMENT_LIST_SUBSCRIPTION = `amendment_list`;

export const getAmendmentListSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `motion_ids`,
                fieldset: [],
                follow: [
                    {
                        idField: `amendment_ids`,
                        fieldset: [`text`, `amendment_paragraphs`],
                        follow: [
                            { idField: `change_recommendation_ids`, fieldset: FULL_FIELDSET },
                            { idField: `lead_motion_id`, fieldset: [`text`, `modified_final_version`] }
                        ]
                    }
                ]
            }
        ]
    },
    subscriptionName: AMENDMENT_LIST_SUBSCRIPTION
});

export const MOTION_FORWARD_DATA_SUBSCRIPTION = `motion_forward_data`;

export const getMotionForwardDataSubscriptionConfig: SubscriptionConfigGenerator = (...ids: Id[]) => ({
    modelRequest: {
        ids,
        viewModelCtor: ViewMotion,
        follow: [
            {
                idField: `amendment_ids`,
                fieldset: [`text`, `modified_final_version`, `amendment_paragraphs`],
                follow: [{ idField: `change_recommendation_ids`, fieldset: FULL_FIELDSET }]
            },
            { idField: `change_recommendation_ids`, fieldset: FULL_FIELDSET }
        ],
        fieldset: [`reason`, `text`, `modified_final_version`, `all_origin_ids`]
    },
    subscriptionName: MOTION_FORWARD_DATA_SUBSCRIPTION
});
