import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

export const AUTOPILOT_SUBSCRIPTION = `autopilot`;

export const getAutopilotSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `reference_projector_id`,
                follow: [
                    {
                        idField: `current_projection_ids`,
                        fieldset: `content`,
                        follow: [
                            {
                                idField: `content_object_id`,
                                follow: [
                                    {
                                        idField: `list_of_speakers_id`,
                                        follow: [
                                            {
                                                idField: `speaker_ids`,
                                                follow: [
                                                    {
                                                        idField: `user_id`,
                                                        fieldset: [
                                                            `pronoun`,
                                                            `first_name`,
                                                            `last_name`,
                                                            `username`,
                                                            { templateField: `number_$` },
                                                            { templateField: `structure_level_$` }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        idField: `poll_ids`,
                                        follow: [
                                            { idField: `content_object_id` },
                                            {
                                                idField: `option_ids`,
                                                follow: [`content_object_id`],
                                                additionalFields: [`text`]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    subscriptionName: AUTOPILOT_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
