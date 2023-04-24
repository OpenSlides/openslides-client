import { ValidatorFn, Validators } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { MotionWorkflow } from 'src/app/domain/models/motions/motion-workflow';
import {
    PollBackendDurationChoices,
    PollPercentBaseVerbose,
    PollTypeVerbose
} from 'src/app/domain/models/poll/poll-constants';

import { OrganizationSettingsService } from '../../../organization/services/organization-settings.service';
import { AssignmentPollMethodVerbose } from '../../pages/assignments/modules/assignment-poll/definitions';

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
    | 'groups';

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

export interface SettingsItem<V = any> {
    key: keyof Settings;
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
    validators?: ValidatorFn[]; // default: []
    automaticChangesSetting?: SettingsItemAutomaticChangeSetting<V>;
    /**
     * A function to restrict some values of a settings-item depending on used organization's settings
     *
     * @param orgaSettings: The `OrganizationSettingsService` has to be passed, because it is not injected in the
     * settings definitions
     * @param value: The value used...
     */
    restrictionFn?: <T>(orgaSettings: OrganizationSettingsService, value: T) => any;
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

export interface SettingsGroup {
    label: string;
    icon: string;
    subgroups: {
        label: string;
        settings: SettingsItem[];
    }[];
}

function fillInSettingsDefaults(settingsGroups: SettingsGroup[]): SettingsGroup[] {
    settingsGroups.forEach(group =>
        group.subgroups.forEach(
            subgroup =>
                (subgroup.settings = subgroup.settings.map(setting =>
                    setting.type ? setting : { ...setting, type: `string` }
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
                        key: `start_time`,
                        label: _(`Start date`),
                        type: `date`,
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
                        key: `end_time`,
                        label: _(`End date`),
                        type: `date`,
                        automaticChangesSetting: {
                            watchProperties: [`start_time`],
                            getChangeFn: (currentValue: number, currentWatchPropertyValues: number[]) => {
                                return currentValue &&
                                    currentWatchPropertyValues.length &&
                                    currentValue < currentWatchPropertyValues[0]
                                    ? currentWatchPropertyValues[0]
                                    : currentValue;
                            }
                        }
                    }
                ]
            },
            {
                label: _(`CSV export options`),
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
                label: _(`PDF export options`),
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
                        validators: [Validators.maxLength(20)]
                    },
                    {
                        key: `agenda_numeral_system`,
                        label: _(`Numeral system for agenda items`),
                        type: `choice`,
                        choices: {
                            arabic: _(`Arabic`),
                            roman: _(`Roman`)
                        }
                    }
                ]
            },
            {
                label: _(`Visibility`),
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
                        key: `agenda_show_internal_items_on_projector`,
                        label: _(`Show internal items when projecting agenda`),
                        type: `boolean`
                    },
                    {
                        key: `agenda_show_subtitles`,
                        label: _(`Show motion submitters in the agenda`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Voting and ballot papers`),
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
                        key: `list_of_speakers_enable_point_of_order_speakers`,
                        label: _(`Enable point of order`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_enable_pro_contra_speech`,
                        label: _(`Enable forspeech / counter speech`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_can_set_contribution_self`,
                        label: _(`Enable star icon to mark speaker (e.g. for contribution)`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_present_users_only`,
                        label: _(`Only present participants can be added to the list of speakers`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_speaker_note_for_everyone`,
                        label: _(
                            `Everyone can see the request of a point of order (instead of managers for list of speakers only)`
                        ),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_initially_closed`,
                        label: _(`List of speakers is initially closed`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_show_first_contribution`,
                        label: _(`Show hint »first speech« in the list of speakers management view`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Projector and countdown`),
                settings: [
                    {
                        key: `list_of_speakers_couple_countdown`,
                        label: _(`Couple countdown with the list of speakers`),
                        type: `boolean`,
                        helpText: _(`[Begin speech] starts the countdown, [End speech] stops the countdown.`)
                    },
                    {
                        key: `list_of_speakers_show_amount_of_speakers_on_slide`,
                        label: _(`Show the amount of speakers in subtitle of list of speakers slide`),
                        type: `boolean`
                    },
                    {
                        key: `list_of_speakers_amount_last_on_projector`,
                        label: _(`Number of last speakers to be shown on the projector`),
                        type: `integer`,
                        validators: [Validators.min(-1)]
                    },
                    {
                        key: `list_of_speakers_amount_next_on_projector`,
                        label: _(`Number of the next speakers to be shown on the projector`),
                        type: `integer`,
                        helpText: _(`Enter number of the next shown speakers. Choose -1 to show all next speakers.`),
                        validators: [Validators.min(-1)]
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
            }
        ]
    },
    {
        label: _(`Motions`),
        icon: `assignment`,
        subgroups: [
            {
                label: _(`General`),
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
                    },
                    {
                        key: `motions_default_statute_amendment_workflow_id`,
                        label: _(`Workflow of new statute amendments`),
                        type: `choice`,
                        choicesFunc: {
                            collection: MotionWorkflow.COLLECTION,
                            idKey: `id`,
                            labelKey: `name`
                        }
                    },
                    {
                        key: `motions_preamble`,
                        label: _(`Motion preamble`)
                    },
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
                            `The maximum number of characters per line. Relevant when line numbering is enabled. Min: 40`
                        ),
                        validators: [Validators.min(40)]
                    },
                    {
                        key: `motions_reason_required`,
                        label: _(`Reason required for creating new motion`),
                        type: `boolean`
                    },
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
                        key: `motions_show_referring_motions`,
                        label: _(`Show referring motions`),
                        type: `boolean`
                    },
                    {
                        key: `motions_enable_sidebox_on_projector`,
                        label: _(`Show meta information box beside the title on projector`),
                        type: `boolean`,
                        helpText: _(`If deactivated it is displayed below the title`)
                    },
                    {
                        key: `motions_show_sequential_number`,
                        label: _(`Show the sequential number for a motion`),
                        helpText: _(`In motion list, motion detail and PDF.`),
                        type: `boolean`
                    },
                    {
                        key: `motions_recommendations_by`,
                        label: _(`Name of recommender`),
                        helpText: _(
                            `Will be displayed as label before selected recommendation. Use an empty value to disable the recommendation system.`
                        )
                    },
                    {
                        key: `motions_statute_recommendations_by`,
                        label: _(`Name of recommender for statute amendments`),
                        helpText: _(`Will be displayed as label before selected recommendation in statute amendments.`)
                    },
                    {
                        key: `motions_recommendation_text_mode`,
                        label: _(`Default text version for change recommendations`),
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
                        key: `motions_default_sorting`,
                        label: _(`Sort motions by`),
                        type: `choice`,
                        choices: {
                            number: _(`Motion number`),
                            weight: _(`Call list`)
                        }
                    }
                ]
            },
            {
                label: _(`Numbering`),
                settings: [
                    {
                        key: `motions_number_type`,
                        label: _(`Motion number`),
                        type: `choice`,
                        choices: {
                            per_category: _(`Numbered per category`),
                            serially_numbered: _(`Serially numbered`),
                            manually: _(`Set it manually`)
                        }
                    },
                    {
                        key: `motions_number_min_digits`,
                        label: _(`Minimum number of digits for motion number`),
                        type: `integer`,
                        helpText: _(`Uses leading zeros to sort motions correctly by number.`),
                        validators: [Validators.min(1)]
                    },
                    {
                        key: `motions_number_with_blank`,
                        label: _(`Allow blank in number`),
                        type: `boolean`,
                        helpText: _(`Blank between prefix and number, e.g. 'A 001'.`)
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
                        key: `motions_statutes_enabled`,
                        label: _(`Activate statute amendments`),
                        type: `boolean`
                    },
                    {
                        key: `motions_amendments_in_main_list`,
                        label: _(`Show amendments together with motions`),
                        type: `boolean`
                    },
                    {
                        key: `motions_amendments_prefix`,
                        label: _(`Prefix for the motion number for amendments`)
                    },
                    {
                        key: `motions_amendments_text_mode`,
                        label: _(`How to create new amendments`),
                        type: `choice`,
                        choices: {
                            freestyle: _(`Empty text field`),
                            fulltext: _(`Edit the whole motion text`),
                            paragraph: _(`Paragraph-based, Diff-enabled`)
                        }
                    },
                    {
                        key: `motions_amendments_multiple_paragraphs`,
                        label: _(`Amendments can change multiple paragraphs`),
                        type: `boolean`
                    },
                    {
                        key: `motions_amendments_of_amendments`,
                        label: _(`Allow amendments of amendments`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`Supporters`),
                settings: [
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
                label: _(`Voting and ballot papers`),
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
                        key: `motion_poll_default_100_percent_base`,
                        label: _(`Default 100 % base of a voting result`),
                        type: `choice`,
                        choices: PollPercentBaseVerbose
                    },
                    {
                        key: `motion_poll_default_group_ids`,
                        label: _(`Default groups with voting rights`),
                        type: `groups`
                    },
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
                label: _(`Projector`),
                settings: [
                    {
                        key: `motions_block_slide_columns`,
                        label: _(`Maximum number of columns on motion block slide`),
                        type: `integer`,
                        validators: [Validators.min(1)]
                    }
                ]
            },
            {
                label: _(`PDF export`),
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
                        key: `assignment_poll_default_method`,
                        label: _(`Default election method`),
                        type: `choice`,
                        choices: AssignmentPollMethodVerbose
                    },
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
                        key: `assignment_poll_default_100_percent_base`,
                        label: _(`Default 100 % base of an election result`),
                        type: `choice`,
                        choices: PollPercentBaseVerbose
                    },
                    {
                        key: `assignment_poll_default_group_ids`,
                        label: _(`Default groups with voting rights`),
                        type: `groups`
                    },
                    {
                        key: `assignment_poll_sort_poll_result_by_votes`,
                        label: _(`Sort election results by amount of votes`),
                        type: `boolean`
                    },
                    {
                        key: `assignment_poll_add_candidates_to_list_of_speakers`,
                        label: _(`Put all candidates on the list of speakers`),
                        type: `boolean`
                    },
                    {
                        key: `assignment_poll_enable_max_votes_per_option`,
                        label: _(`Allow to accumulate several votes on one candidate ("comulative voting")`),
                        type: `boolean`
                    },
                    {
                        key: `assignment_poll_default_backend`,
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
            },
            {
                label: _(`PDF export`),
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
                    },
                    {
                        key: `users_enable_vote_delegations`,
                        label: _(`Activate vote delegations`),
                        type: `boolean`
                    }
                ]
            },
            {
                label: _(`PDF export`),
                settings: [
                    {
                        key: `users_pdf_welcometitle`,
                        label: _(`Title for access data and welcome PDF`)
                    },
                    {
                        key: `users_pdf_welcometext`,
                        label: _(`Help text for access data and welcome PDF`)
                    },
                    {
                        key: `users_pdf_wlan_ssid`,
                        label: _(`WLAN name (SSID)`),
                        helpText: _(`Used for WLAN QRCode in PDF of access data.`)
                    },
                    {
                        key: `users_pdf_wlan_password`,
                        label: _(`WLAN password`),
                        helpText: _(`Used for WLAN QRCode in PDF of access data.`)
                    },
                    {
                        key: `users_pdf_wlan_encryption`,
                        label: _(`WLAN encryption`),
                        type: `choice`,
                        helpText: _(`Used for WLAN QRCode in PDF of access data.`),
                        choices: {
                            '': `---------`,
                            WEP: `WEP`,
                            WPA: `WPA/WPA2`,
                            nopass: _(`No encryption`)
                        }
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
                            `The sender address is defined in the OpenSlides server settings and should modified by administrator only.`
                        ),
                        dontTranslateDefault: true
                    },
                    {
                        key: `users_email_replyto`,
                        label: _(`Reply address`),
                        type: `email`,
                        validators: [Validators.email]
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
                        type: `boolean`
                    },
                    {
                        key: `applause_type`,
                        label: _(`Applause visualization`),
                        type: `choice`,
                        choices: {
                            'applause-type-bar': _(`Level indicator`),
                            'applause-type-particles': _(`Particles`)
                        }
                    },
                    {
                        key: `applause_particle_image_url`,
                        label: _(`Applause particle image URL`),
                        helpText: _(
                            `Shows the given image as applause particle. Recommended image format: 24x24px, PNG, JPG or SVG`
                        )
                    },
                    {
                        key: `applause_min_amount`,
                        label: _(`Lowest applause amount`),
                        helpText: _(`Defines the minimum deflection which is required to recognize applause.`),
                        type: `integer`
                    },
                    {
                        key: `applause_max_amount`,
                        label: _(`Highest applause amount`),
                        helpText: _(
                            `Defines the maximum deflection. Entering zero will use the amount of present participants instead.`
                        ),
                        type: `integer`
                    },
                    {
                        key: `applause_timeout`,
                        label: _(`Applause interval in seconds`),
                        helpText: _(`Defines the time in which applause amounts are add up.`),
                        type: `integer`
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
