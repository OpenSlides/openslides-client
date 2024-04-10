import { ValidatorFn, Validators } from '@angular/forms';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { MotionWorkflow } from 'src/app/domain/models/motions/motion-workflow';
import {
    PollBackendDurationChoices,
    PollPercentBaseVerbose,
    PollTypeVerbose
} from 'src/app/domain/models/poll/poll-constants';
import { ObjectReplaceKeysConfig } from 'src/app/infrastructure/utils';
import { createEmailValidator } from 'src/app/infrastructure/utils/validators/email';

import { OrganizationSettingsService } from '../../../organization/services/organization-settings.service';
import { AssignmentPollMethodVerbose } from '../../pages/assignments/modules/assignment-poll/definitions';

export type SettingsValueMap = { [key in keyof Settings]?: any };

export type SettingsType =
    | 'string'
    | 'email'
    | 'text'
    | 'markupText'
    | 'integer'
    | 'boolean'
    | 'choice'
    | 'date'
    | 'datetime'
    | 'translations'
    | 'ranking'
    | 'groups'
    | 'daterange';

export interface ChoicesMap {
    [name: string]: string | number;
}

/**
 * Need for settings that depend on models. The collection is resolved via the
 * CollectionMapperService and the keys are read from each model to build a
 * ChoicesMap (see MeetingSettingsField).
 */
export interface ChoicesFunctionDefinition<V> {
    collection: string;
    idKey: keyof V;
    labelKey: keyof V;
}

export interface SettingsInput<V = any> {
    key: keyof Settings | (keyof Settings)[]; // Array can be used with fields that require multiple values (like then type === 'daterange')
    label: string;
    type?: SettingsType; // default: text
    // if true, the default value will not be translated
    // (only valid for type == string)
    dontTranslateDefault?: boolean;
    // mandatory for type=choice; maps value <-> label
    choices?: ChoicesMap;
    // alternative to `choices`; overwrites `choices` if both are given
    choicesFunc?: ChoicesFunctionDefinition<V>;
    helpText?: string; // default: ""
    indentation?: number; // default: 0. Indents the input field by the given amount to simulate nested settings
    validators?: ValidatorFn[]; // default: []
    automaticChangesSetting?: SettingsItemAutomaticChangeSetting<V>;
    useRelation?: boolean; // May be set to true for relation id fields to get the relation item(s) instead if the id(s)
    keyTransformationConfig?: ObjectReplaceKeysConfig; // May be set if the value is expected to be an object. If it is, all keys will be transformed according to the lines before they are passed to the forms, and back before the form is saved.
    pickKeys?: string[]; // If the value is an object, this will throw away all properties, except the given keys, this is done before the keyTransformation
    /**
     * A function to restrict some values of a settings-item depending on used organization's settings
     *
     * @param orgaSettings: The `OrganizationSettingsService` has to be passed, because it is not injected in the
     * settings definitions
     * @param value: The value used...
     */
    restrictionFn?: <T>(orgaSettings: OrganizationSettingsService, value: T) => any;
    /**
     * A function to conditionally disable the setting.
     *
     * @param settings All current settings values, mapped by their keys
     * @returns whether to disable the setting or not
     */
    disable?: (settings: SettingsValueMap) => boolean;
    hide?: boolean; // Hide the setting in the settings view
}

interface SettingsItemAutomaticChangeSetting<V> {
    /**
     * A list of properties that will be listened to, upon any changes, the value of the parent field should be set to value returned by getChangeFnn
     */
    watchProperties: (keyof Settings)[];
    /**
     * If called with the current values of the parent field and the watch properties, it will return the appropriate Value that the parent field should hold
     */
    getChangeFn: (currentValue: V, currentWatchPropertyValues: any[]) => V;
}

export enum SettingsHelpTextLinkType {
    Meeting,
    Organization,
    External
}

export interface SettingsHelpText {
    text?: string;
    buttonLabel?: string;
    buttonLink?: string;
    buttonLinkType?: SettingsHelpTextLinkType;
}

export type SettingsItem = SettingsInput | SettingsHelpText;

export interface SettingsGroup {
    label: string;
    icon: string;
    subgroups: {
        label: string;
        settings: SettingsItem[];
    }[];
}

export function isSettingsInput(item: SettingsItem): item is SettingsInput {
    return `key` in item;
}
export const SKIPPED_SETTINGS = [
    `motions_default_workflow_id`,
    `motions_default_amendment_workflow_id`,
    `motions_default_statute_amendment_workflow_id`,
    `point_of_order_category_ids`
];

function fillInSettingsDefaults(settingsGroups: SettingsGroup[]): SettingsGroup[] {
    settingsGroups.forEach(group =>
        group.subgroups.forEach(
            subgroup =>
                (subgroup.settings = subgroup.settings.map(setting =>
                    !isSettingsInput(setting) || setting.type ? setting : { ...setting, type: `string` }
                ))
        )
    );
    return settingsGroups;
}

export const meetingSettings: SettingsGroup[] = fillInSettingsDefaults([
    {
        label: _(`General`),
        icon: `home`,
        subgroups: [
            {
                label: _(`Meeting information`),
                settings: [
                    {
                        key: `name`,
                        label: _(`Meeting title`)
                    },
                    {
                        key: `description`,
                        label: _(`Description`)
                    },
                    {
                        key: `location`,
                        label: _(`Event location`)
                    },
                    {
                        key: [`start_time`, `end_time`],
                        label: _(`Meeting date`),
                        type: `daterange`,
                        automaticChangesSetting: {
                            watchProperties: [`end_time`],
                            getChangeFn: (currentValue: number, currentWatchPropertyValues: number[]) => {
                                return currentValue &&
                                    currentWatchPropertyValues.length &&
                                    currentValue > currentWatchPropertyValues[0]
                                    ? currentWatchPropertyValues[0]
                                    : currentValue;
                            }
                        }
                    },
                    {
                        key: `external_id`,
                        label: _(`External ID`)
                    }
                ]
            },
            {
                label: _(`Wifi`),
                settings: [
                    {
                        key: `users_pdf_wlan_ssid`,
                        label: _(`WLAN name (SSID)`),
                        helpText: _(`Used for WLAN QRCode projection.`)
                    },
                    {
                        key: `users_pdf_wlan_password`,
                        label: _(`WLAN password`),
                        helpText: _(`Used for WLAN QRCode projection.`)
                    },
                    {
                        key: `users_pdf_wlan_encryption`,
                        label: _(`WLAN encryption`),
                        type: `choice`,
                        helpText: _(`Used for WLAN QRCode projection.`),
                        choices: {
                            WEP: `WEP`,
                            WPA: `WPA/WPA2`,
                            nopass: _(`No encryption`)
                        }
                    }
                ]
            }
        ]
    },
    {
        label: _(`Agenda`),
        icon: `today`,
        subgroups: [
            {
                label: _(`Numbering`),
                settings: [
                    {
                        key: `agenda_enable_numbering`,
                        label: _(`Enable numbering for agenda items`),
                        type: `boolean`
                    },
                    {
                        key: `agenda_number_prefix`,
                        label: _(`Numbering prefix for agenda items`),
                        helpText: _(`This prefix will be set if you run the automatic agenda numbering.`),
                        validators: [Validators.maxLength(20)],
                        indentation: 1,
                        disable: settings => !settings.agenda_enable_numbering
                    },
                    {
                        key: `agenda_numeral_system`,
                        label: _(`Numeral system for agenda items`),
                        type: `choice`,
                        choices: {
                            arabic: _(`Arabic`),
                            roman: _(`Roman`)
                        },
                        indentation: 1,
                        disable: settings => !settings.agenda_enable_numbering
                    }
                ]
            },
            {
                label: _(`View`),
                settings: [
                    {
                        key: `agenda_item_creation`,
                        label: _(`Add to agenda`),
                        type: `choice`,
                        choices: {
                            // matches AgendaItemCreation
                            always: _(`Always`),
                            never: _(`Never`),
                            default_yes: _(`Ask, default yes`),
                            default_no: _(`Ask, default no`)
                        }
                    },
                    {
                        key: `agenda_new_items_default_visibility`,
                        label: _(`Default visibility for new agenda items (except topics)`),
                        type: `choice`,
                        choices: {
                            [AgendaItemType.COMMON]: _(`Public item`),
                            [AgendaItemType.INTERNAL]: _(`Internal item`),
                            [AgendaItemType.HIDDEN]: _(`Hidden item`)
                        }
                    },
                    {
                        key: `agenda_show_subtitles`,
                        label: _(`Show motion submitters in the agenda`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Projection`),
                settings: [
                    {
                        key: `agenda_show_internal_items_on_projector`,
                        label: _(`Show internal items when projecting agenda`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Vote`),
                settings: [
                    {
                        key: `topic_poll_default_group_ids`,
                        label: _(`Default groups with voting rights`),
                        type: `groups`
                    }
                ]
            }
        ]
    },
    {
        label: _(`List of speakers`),
        icon: `record_voice_over`,
        subgroups: [
            {
                label: _(`General`),
                settings: [
                    {
                        key: `list_of_speakers_initially_closed`,
                        label: _(`List of speakers is initially closed`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_present_users_only`,
                        label: _(`Only present participants can be added to the list of speakers`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_allow_multiple_speakers`,
                        label: _(`Allow one participant multiple times on the same list`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_show_first_contribution`,
                        label: _(`Show hint »first speech« in the list of speakers management view`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_hide_contribution_count`,
                        label: _(`Hide note on number of multiple contributions`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Speech type`),
                settings: [
                    {
                        key: `list_of_speakers_enable_pro_contra_speech`,
                        label: _(`Enable forspeech / counter speech`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_can_set_contribution_self`,
                        label: _(`Enable star icon usage by speakers`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Projection`),
                settings: [
                    {
                        key: `list_of_speakers_show_amount_of_speakers_on_slide`,
                        label: _(`Show the amount of speakers in subtitle of list of speakers slide`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_amount_next_on_projector`,
                        label: _(`Number of the next speakers to be shown on the projector`),
                        type: `integer`,
                        helpText: _(`Enter number of the next shown speakers. Choose -1 to show all next speakers.`),
                        validators: [Validators.min(-1)]
                    },
                    {
                        key: `list_of_speakers_amount_last_on_projector`,
                        label: _(`Number of last speakers to be shown on the projector`),
                        type: `integer`,
                        validators: [Validators.min(-1)]
                    }
                ]
            },
            {
                label: _(`Countdown`),
                settings: [
                    {
                        key: `list_of_speakers_couple_countdown`,
                        label: _(`Couple countdown with the list of speakers`),
                        type: `boolean`,
                        helpText: _(`[Begin speech] starts the countdown, [End speech] stops the countdown.`)
                    },
                    {
                        key: `projector_countdown_warning_time`,
                        label: _(`Show orange countdown in the last x seconds of speaking time`),
                        type: `integer`,
                        helpText: _(`Enter duration in seconds. Choose 0 to disable warning color.`),
                        validators: [Validators.min(0)]
                    },
                    {
                        key: `projector_countdown_default_time`,
                        label: _(`Predefined seconds of new countdowns`),
                        type: `integer`
                    }
                ]
            },
            {
                label: _(`Point of order`),
                settings: [
                    {
                        key: `list_of_speakers_enable_point_of_order_speakers`,
                        label: _(`Enable point of order`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_speaker_note_for_everyone`,
                        label: _(
                            `Everyone can see the request of a point of order (instead of managers for list of speakers only)`
                        ),
                        type: `boolean`,
                        indentation: 1,
                        disable: settings => !settings.list_of_speakers_enable_point_of_order_speakers
                    },
                    {
                        key: `list_of_speakers_can_create_point_of_order_for_others`,
                        label: _(`Enable point of orders for other participants`),
                        helpText: _(`Requires permission to manage lists of speakers`),
                        type: `boolean`,
                        indentation: 1,
                        disable: settings => !settings.list_of_speakers_enable_point_of_order_speakers
                    },
                    {
                        key: `list_of_speakers_closing_disables_point_of_order`,
                        label: _(`Disallow new point of order when list of speakers is closed`),
                        type: `boolean`,
                        indentation: 1,
                        disable: settings => !settings.list_of_speakers_enable_point_of_order_speakers
                    },
                    {
                        key: `list_of_speakers_enable_point_of_order_categories`,
                        label: _(`Enable specifications and ranking for possible motions`),
                        type: `boolean`,
                        indentation: 1,
                        disable: settings => !settings.list_of_speakers_enable_point_of_order_speakers
                    },
                    {
                        key: `point_of_order_category_ids`,
                        label: `Point of order specifications`,
                        type: `ranking`,
                        useRelation: true,
                        keyTransformationConfig: [
                            [`text`, `entry`],
                            [`rank`, `allocation`]
                        ],
                        pickKeys: [`id`, `text`, `rank`],
                        indentation: 2,
                        disable: settings =>
                            !settings.list_of_speakers_enable_point_of_order_categories ||
                            !settings.list_of_speakers_enable_point_of_order_speakers
                    }
                ]
            },
            {
                label: _(`Parliament options`),
                settings: [
                    {
                        text: _(
                            `OpenSlides offers various speaking list customizations for use in parliament. These include the configuration of speaking time quotas for parliamentary groups (e.g. fractions, coalitions) as well as extended types of speeches such as short interventions and (parliamentary) interposed questions.`
                        )
                    },
                    {
                        key: `list_of_speakers_default_structure_level_time`,
                        label: _(
                            `Default speaking time contingent for parliamentary groups (structure levels) in seconds`
                        ),
                        helpText: _(`Choose 0 to disable speaking times widget for structure level countdowns.`),
                        type: `integer`,
                        validators: [Validators.min(0)]
                    },
                    {
                        key: `list_of_speakers_intervention_time`,
                        label: _(`Intervention speaking time in seconds`),
                        type: `integer`,
                        helpText: _(`Choose 0 to disable Intervention.`),
                        validators: [Validators.min(0)]
                    },
                    {
                        key: `list_of_speakers_enable_interposed_question`,
                        label: _(`Enable interposed questions`),
                        type: `boolean`
                    }
                ]
            }
        ]
    },
    {
        label: _(`Motions`),
        icon: `assignment`,
        subgroups: [
            {
                label: _(`Workflow`),
                settings: [
                    {
                        key: `motions_default_workflow_id`,
                        label: _(`Workflow of new motions`),
                        type: `choice`,
                        choicesFunc: {
                            collection: MotionWorkflow.COLLECTION,
                            idKey: `id`,
                            labelKey: `name`
                        }
                    },
                    {
                        key: `motions_default_amendment_workflow_id`,
                        label: _(`Workflow of new amendments`),
                        type: `choice`,
                        choicesFunc: {
                            collection: MotionWorkflow.COLLECTION,
                            idKey: `id`,
                            labelKey: `name`
                        }
                    }
                ]
            },
            {
                label: _(`Formalities`),
                settings: [
                    {
                        key: `motions_preamble`,
                        label: _(`Motion preamble`)
                    },
                    {
                        key: `motions_recommendations_by`,
                        label: _(`Name of recommender`),
                        helpText: _(
                            `Will be displayed as label before selected recommendation. Use an empty value to disable the recommendation system.`
                        )
                    },
                    {
                        key: `motions_reason_required`,
                        label: _(`Reason required for creating new motion`),
                        type: `boolean`
                    },
                    {
                        key: `motions_enable_editor`,
                        label: _(`Activate the selection field 'motion editor'`),
                        type: `boolean`
                    },
                    {
                        key: `motions_enable_working_group_speaker`,
                        label: _(`Activate the selection field 'spokesperson'`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`View`),
                settings: [
                    {
                        key: `motions_default_line_numbering`,
                        label: _(`Default line numbering`),
                        type: `choice`,
                        choices: {
                            // matches LineNumberingMode
                            outside: _(`outside`),
                            inline: _(`inline`),
                            none: _(`disabled`)
                        }
                    },
                    {
                        key: `motions_line_length`,
                        label: _(`Line length`),
                        type: `integer`,
                        helpText: _(
                            `The maximum number of characters per line. Relevant when line numbering is enabled. Min: 40. Note: Check PDF export and font.`
                        ),
                        validators: [Validators.min(40)]
                    },
                    {
                        key: `motions_recommendation_text_mode`,
                        label: _(`Default text version for change recommendations and projection of motions`),
                        type: `choice`,
                        choices: {
                            // matches ChangeRecoMode
                            original: _(`Original version`),
                            changed: _(`Changed version`),
                            diff: _(`Diff version`),
                            agreed: _(`Final version`)
                        }
                    },
                    {
                        key: `motions_show_referring_motions`,
                        label: _(`Show referring motions`),
                        type: `boolean`
                    },
                    {
                        key: `motions_show_sequential_number`,
                        label: _(`Show the sequential number for a motion`),
                        helpText: _(`In motion list, motion detail and PDF.`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Projection`),
                settings: [
                    {
                        key: `motions_enable_text_on_projector`,
                        label: _(`Show motion text on projector`),
                        type: `boolean`
                    },
                    {
                        key: `motions_enable_reason_on_projector`,
                        label: _(`Show reason on projector`),
                        type: `boolean`
                    },
                    {
                        key: `motions_enable_recommendation_on_projector`,
                        label: _(`Show recommendation on projector`),
                        type: `boolean`
                    },
                    {
                        key: `motions_enable_sidebox_on_projector`,
                        label: _(`Show meta information box beside the title on projector`),
                        type: `boolean`,
                        helpText: _(`If deactivated it is displayed below the title`)
                    },
                    {
                        key: `motions_block_slide_columns`,
                        label: _(`Maximum number of columns on motion block slide`),
                        type: `integer`,
                        validators: [Validators.min(1)]
                    }
                ]
            },
            {
                label: _(`Numbering and sorting`),
                settings: [
                    {
                        key: `motions_number_with_blank`,
                        label: _(`Allow blank in number`),
                        type: `boolean`,
                        helpText: _(`Blank between prefix and number, e.g. 'A 001'.`)
                    },
                    {
                        key: `motions_number_min_digits`,
                        label: _(`Minimum number of digits for motion identifier`),
                        type: `integer`,
                        helpText: _(`Uses leading zeros to sort motions correctly by identifier.`),
                        validators: [Validators.min(1)]
                    },
                    {
                        key: `motions_number_type`,
                        label: _(`Motion identifier`),
                        type: `choice`,
                        choices: {
                            per_category: _(`Numbered per category`),
                            serially_numbered: _(`Serially numbered`),
                            manually: _(`Set it manually`)
                        }
                    },
                    {
                        key: `motions_default_sorting`,
                        label: _(`Sort motions by`),
                        type: `choice`,
                        choices: {
                            number: _(`Identifier`),
                            weight: _(`Call list`)
                        }
                    }
                ]
            },
            {
                label: _(`Amendments`),
                settings: [
                    {
                        key: `motions_amendments_enabled`,
                        label: _(`Activate amendments`),
                        type: `boolean`
                    },
                    {
                        key: `motions_amendments_in_main_list`,
                        label: _(`Show amendments together with motions`),
                        type: `boolean`,
                        indentation: 1,
                        disable: settings => !settings.motions_amendments_enabled
                    },
                    {
                        key: `motions_amendments_multiple_paragraphs`,
                        label: _(`Amendments can change multiple paragraphs`),
                        type: `boolean`,
                        indentation: 1,
                        disable: settings => !settings.motions_amendments_enabled
                    },
                    {
                        key: `motions_amendments_of_amendments`,
                        label: _(`Allow amendments of amendments`),
                        type: `boolean`,
                        indentation: 1,
                        disable: settings => !settings.motions_amendments_enabled
                    },
                    {
                        key: `motions_amendments_prefix`,
                        label: _(`Prefix for the motion identifier of amendments`),
                        indentation: 1,
                        disable: settings => !settings.motions_amendments_enabled
                    },
                    {
                        key: `motions_amendments_text_mode`,
                        label: _(`How to create new amendments`),
                        type: `choice`,
                        choices: {
                            freestyle: _(`Empty text field`),
                            fulltext: _(`Edit the whole motion text`),
                            paragraph: _(`Paragraph-based, Diff-enabled`)
                        },
                        indentation: 1,
                        disable: settings => !settings.motions_amendments_enabled
                    }
                ]
            },
            {
                label: _(`Supporters`),
                settings: [
                    {
                        text: _(`For activation:<br>
                        1. Assign group permission (define the group that can support motions)<br>
                        2. Adjust workflow (define state in which motions can be supported)<br>
                        3. Enter minimum number (see next field)`)
                    },
                    {
                        key: `motions_supporters_min_amount`,
                        label: _(`Number of (minimum) required supporters for a motion`),
                        type: `integer`,
                        helpText: _(`Choose 0 to disable the supporting system.`),
                        validators: [Validators.min(0)]
                    }
                ]
            },
            {
                label: _(`Vote`),
                settings: [
                    {
                        key: `motion_poll_default_type`,
                        label: _(`Default voting type`),
                        type: `choice`,
                        choices: PollTypeVerbose,
                        restrictionFn: (orgaSettings, value: any) => {
                            const isElectronicVotingEnabled = orgaSettings.instant(`enable_electronic_voting`);
                            if (!isElectronicVotingEnabled && typeof value !== `string`) {
                                return { analog: `analog` };
                            }
                            return value;
                        }
                    },
                    {
                        key: `motion_poll_default_group_ids`,
                        label: _(`Default groups with voting rights`),
                        type: `groups`
                    },
                    {
                        key: `motion_poll_default_onehundred_percent_base`,
                        label: _(`Default 100 % base`),
                        type: `choice`,
                        choices: PollPercentBaseVerbose
                    },
                    {
                        key: `motion_poll_default_backend`,
                        label: _(`Default voting duration`),
                        type: `choice`,
                        choices: PollBackendDurationChoices,
                        helpText: _(
                            `Voting ends after short (some seconds/minutes) or long (some days/weeks) time period.`
                        )
                    }
                ]
            },
            {
                label: _(`Ballot papers`),
                settings: [
                    {
                        key: `motion_poll_ballot_paper_selection`,
                        label: _(`Number of ballot papers`),
                        type: `choice`,
                        choices: {
                            NUMBER_OF_DELEGATES: _(`Number of all delegates`),
                            NUMBER_OF_ALL_PARTICIPANTS: _(`Number of all participants`),
                            CUSTOM_NUMBER: _(`Use the following custom number`)
                        }
                    },
                    {
                        key: `motion_poll_ballot_paper_number`,
                        label: _(`Custom number of ballot papers`),
                        type: `integer`,
                        validators: [Validators.min(1)]
                    }
                ]
            }
        ]
    },
    {
        label: _(`Elections`),
        icon: `how_to_vote`,
        subgroups: [
            {
                label: _(`Ballot`),
                settings: [
                    {
                        key: `assignment_poll_default_type`,
                        label: _(`Default voting type`),
                        type: `choice`,
                        choices: PollTypeVerbose,
                        restrictionFn: (orgaSettings, value: any) => {
                            const isElectronicVotingEnabled = orgaSettings.instant(`enable_electronic_voting`);
                            if (!isElectronicVotingEnabled && typeof value !== `string`) {
                                return { analog: `analog` };
                            }
                            return value;
                        }
                    },
                    {
                        key: `assignment_poll_default_group_ids`,
                        label: _(`Default groups with voting rights`),
                        type: `groups`
                    },
                    {
                        key: `assignment_poll_default_method`,
                        label: _(`Default election method`),
                        type: `choice`,
                        choices: AssignmentPollMethodVerbose
                    },
                    {
                        key: `assignment_poll_default_onehundred_percent_base`,
                        label: _(`Default 100 % base`),
                        type: `choice`,
                        choices: PollPercentBaseVerbose
                    },
                    {
                        key: `assignment_poll_default_backend`,
                        label: _(`Default voting duration`),
                        type: `choice`,
                        choices: PollBackendDurationChoices,
                        helpText: _(
                            `Voting ends after short (some seconds/minutes) or long (some days/weeks) time period.`
                        )
                    },
                    {
                        key: `assignment_poll_enable_max_votes_per_option`,
                        label: _(`Allow to accumulate several votes on one candidate ("comulative voting")`),
                        type: `boolean`
                    },
                    {
                        key: `assignment_poll_sort_poll_result_by_votes`,
                        label: _(`Sort election results by amount of votes`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`List of speakers`),
                settings: [
                    {
                        key: `assignment_poll_add_candidates_to_list_of_speakers`,
                        label: _(`Put all candidates on the list of speakers`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Ballot papers`),
                settings: [
                    {
                        key: `assignment_poll_ballot_paper_selection`,
                        label: _(`Number of ballot papers`),
                        type: `choice`,
                        choices: {
                            NUMBER_OF_DELEGATES: _(`Number of all delegates`),
                            NUMBER_OF_ALL_PARTICIPANTS: _(`Number of all participants`),
                            CUSTOM_NUMBER: _(`Use the following custom number`)
                        }
                    },
                    {
                        key: `assignment_poll_ballot_paper_number`,
                        label: _(`Custom number of ballot papers`),
                        type: `integer`,
                        validators: [Validators.min(1)]
                    }
                ]
            }
        ]
    },
    {
        label: _(`Participants`),
        icon: `groups`,
        subgroups: [
            {
                label: _(`General`),
                settings: [
                    {
                        key: `users_allow_self_set_present`,
                        label: _(`Allow users to set themselves as present`),
                        type: `boolean`,
                        helpText: _(`e.g. for online meetings`)
                    },
                    {
                        key: `users_enable_presence_view`,
                        label: _(`Enable participant presence view`),
                        type: `boolean`
                    },
                    {
                        key: `users_enable_vote_weight`,
                        label: _(`Activate vote weight`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Vote delegation`),
                settings: [
                    {
                        key: `users_enable_vote_delegations`,
                        label: _(`Activate vote delegations`),
                        type: `boolean`
                    },
                    {
                        key: `users_forbid_delegator_in_list_of_speakers`,
                        label: _(`Restrict delegation principals from adding themselves to the list of speakers.`),
                        helpText: _(
                            `Enabling this will cause non-present participants, whose voting rights have been delegated, to be unable to add themselves to any list of speakers unless they have managing rights.`
                        ),
                        type: `boolean`
                    },
                    {
                        key: `users_forbid_delegator_as_submitter`,
                        label: _(`Restrict delegation principals from creating motions.`),
                        helpText: _(
                            `Enabling this will cause non-present participants, whose voting rights have been delegated, to be unable to create motions unless they have managing rights.`
                        ),
                        type: `boolean`
                    },
                    {
                        key: `users_forbid_delegator_as_supporter`,
                        label: _(`Restrict delegation principals from supporting motions.`),
                        helpText: _(
                            `Enabling this will cause non-present participants, whose voting rights have been delegated, to be unable to support motions unless they have managing rights.`
                        ),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Email`),
                settings: [
                    {
                        key: `users_email_sender`,
                        label: _(`Sender name`),
                        helpText: _(
                            `IMPORTANT: The sender address (noreply@openslides.com) is defined in the OpenSlides server settings and cannot be changed here.
                            To receive replies you have to enter a reply address in the next field. Please test the email dispatch in case of changes!`
                        ),
                        dontTranslateDefault: true
                    },
                    {
                        key: `users_email_replyto`,
                        label: _(`Reply address`),
                        type: `email`,
                        validators: [createEmailValidator()]
                    },
                    {
                        key: `users_email_subject`,
                        label: _(`Email subject`),
                        helpText: _(`You can use {event_name} and {username} as placeholder.`)
                    },
                    {
                        key: `users_email_body`,
                        label: _(`Email body`),
                        type: `text`,
                        helpText: _(
                            `Use these placeholders: {name}, {event_name}, {url}, {username}, {password}. The url referrs to the system url.`
                        )
                    }
                ]
            }
        ]
    },
    {
        label: _(`Livestream`),
        icon: `phone`,
        subgroups: [
            {
                label: _(`Livestream`),
                settings: [
                    {
                        key: `conference_stream_url`,
                        label: _(`Livestream URL`),
                        helpText: _(
                            `Remove URL to deactivate livestream. Check extra group permission to see livestream.`
                        )
                    },
                    {
                        key: `conference_stream_poster_url`,
                        label: _(`Livestream poster image url`),
                        helpText: _(
                            `Shows if livestream is not started. Recommended image format: 500x200px, PNG or JPG`
                        )
                    }
                ]
            },
            {
                label: _(`Live conference`),
                settings: [
                    {
                        key: `conference_show`,
                        label: _(`Show live conference window`),
                        type: `boolean`,
                        helpText: _(`Server settings required to activate Jitsi Meet integration.`)
                    },
                    {
                        key: `conference_los_restriction`,
                        label: _(
                            `Allow only current speakers and list of speakers managers to enter the live conference`
                        ),
                        type: `boolean`
                    },
                    {
                        key: `conference_auto_connect`,
                        label: _(`Connect all users to live conference automatically.`),
                        type: `boolean`
                    },
                    {
                        key: `conference_open_microphone`,
                        label: _(`Automatically open the microphone for new conference speakers`),
                        type: `boolean`
                    },
                    {
                        key: `conference_open_video`,
                        label: _(`Automatically open the web cam for new conference speakers`),
                        type: `boolean`
                    },
                    {
                        key: `conference_auto_connect_next_speakers`,
                        label: _(`Number of next speakers automatically connecting to the live conference`),
                        type: `integer`
                    },
                    {
                        key: `conference_enable_helpdesk`,
                        label: _(`Enable virtual help desk room`),
                        helpText: _(
                            `Shows a button with help icon to connect to an extra Jitsi conference room for technical audio/video tests.`
                        ),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Virtual applause`),
                settings: [
                    {
                        key: `applause_enable`,
                        label: _(`Enable virtual applause`),
                        type: `boolean`
                    },
                    {
                        key: `applause_show_level`,
                        label: _(`Show applause amount`),
                        type: `boolean`,
                        indentation: 1,
                        disable: settings => !settings.applause_enable
                    },
                    {
                        key: `applause_type`,
                        label: _(`Applause visualization`),
                        type: `choice`,
                        choices: {
                            'applause-type-bar': _(`Level indicator`),
                            'applause-type-particles': _(`Particles`)
                        },
                        indentation: 1,
                        disable: settings => !settings.applause_enable
                    },
                    {
                        key: `applause_particle_image_url`,
                        label: _(`Applause particle image URL`),
                        helpText: _(
                            `Shows the given image as applause particle. Recommended image format: 24x24px, PNG, JPG or SVG`
                        ),
                        indentation: 1,
                        disable: settings => !settings.applause_enable
                    },
                    {
                        key: `applause_min_amount`,
                        label: _(`Lowest applause amount`),
                        helpText: _(`Defines the minimum deflection which is required to recognize applause.`),
                        type: `integer`,
                        indentation: 1,
                        disable: settings => !settings.applause_enable
                    },
                    {
                        key: `applause_max_amount`,
                        label: _(`Highest applause amount`),
                        helpText: _(
                            `Defines the maximum deflection. Entering zero will use the amount of present participants instead.`
                        ),
                        type: `integer`,
                        indentation: 1,
                        disable: settings => !settings.applause_enable
                    },
                    {
                        key: `applause_timeout`,
                        label: _(`Applause interval in seconds`),
                        helpText: _(`Defines the time in which applause amounts are add up.`),
                        type: `integer`,
                        indentation: 1,
                        disable: settings => !settings.applause_enable
                    }
                ]
            }
        ]
    },
    {
        label: _(`Export`),
        icon: `archive`,
        subgroups: [
            {
                label: _(`CSV options`),
                settings: [
                    {
                        key: `export_csv_separator`,
                        label: _(`Separator used for all CSV exports and examples`),
                        dontTranslateDefault: true
                    },
                    {
                        key: `export_csv_encoding`,
                        label: _(`Default encoding for all CSV exports`),
                        type: `choice`,
                        choices: {
                            // matches ExportCsvEncoding
                            'utf-8': `UTF-8`,
                            'iso-8859-15': `ISO-8859-15`
                        }
                    }
                ]
            },
            {
                label: _(`PDF options`),
                settings: [
                    {
                        key: `export_pdf_pagenumber_alignment`,
                        label: _(`Page number alignment in PDF`),
                        type: `choice`,
                        choices: {
                            left: _(`Left`),
                            center: _(`Center`),
                            right: _(`Right`)
                        }
                    },
                    {
                        key: `export_pdf_fontsize`,
                        label: _(`Font size in pt`),
                        type: `integer`,
                        validators: [Validators.min(10), Validators.max(12)],
                        helpText: _(`Available sizes are 10, 11 and 12`)
                    },
                    {
                        key: `export_pdf_line_height`,
                        label: _(`Line spacing`),
                        type: `integer`
                    },
                    {
                        key: `export_pdf_page_margin_left`,
                        label: _(`Page margin left in mm`),
                        type: `integer`
                    },
                    {
                        key: `export_pdf_page_margin_right`,
                        label: _(`Page margin right in mm`),
                        type: `integer`
                    },
                    {
                        key: `export_pdf_page_margin_top`,
                        label: _(`Page margin top in mm`),
                        type: `integer`
                    },
                    {
                        key: `export_pdf_page_margin_bottom`,
                        label: _(`Page margin bottom in mm`),
                        type: `integer`
                    },
                    {
                        key: `export_pdf_pagesize`,
                        label: _(`Page format`),
                        type: `choice`,
                        choices: {
                            A4: `DIN A4`,
                            A5: `DIN A5`
                        }
                    }
                ]
            },
            {
                label: _(`Motions (PDF settings)`),
                settings: [
                    {
                        key: `motions_export_title`,
                        label: _(`Title for PDF documents of motions`)
                    },
                    {
                        key: `motions_export_preamble`,
                        label: _(`Preamble text for PDF documents of motions`)
                    },
                    {
                        key: `motions_export_submitter_recommendation`,
                        label: _(`Show submitters and recommendation/state in table of contents`),
                        type: `boolean`
                    },
                    {
                        key: `motions_export_follow_recommendation`,
                        label: _(`Show checkbox to record decision`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Elections (PDF settings)`),
                settings: [
                    {
                        key: `assignments_export_title`,
                        label: _(`Title for PDF document (all elections)`)
                    },
                    {
                        key: `assignments_export_preamble`,
                        label: _(`Preamble text for PDF document (all elections)`)
                    }
                ]
            },
            {
                label: _(`Participants (PDF settings)`),
                settings: [
                    {
                        key: `users_pdf_welcometitle`,
                        label: _(`Title for access data and welcome PDF`)
                    },
                    {
                        key: `users_pdf_welcometext`,
                        label: _(`Help text for access data and welcome PDF`)
                    }
                ]
            }
        ]
    },
    {
        label: _(`Custom translations`),
        icon: `language`,
        subgroups: [
            {
                label: `Custom translations`,
                settings: [
                    {
                        key: `custom_translations`,
                        label: `Custom translations`,
                        type: `translations`
                    }
                ]
            }
        ]
    }
]);
