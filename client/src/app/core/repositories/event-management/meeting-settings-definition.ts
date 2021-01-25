import { ValidatorFn, Validators } from '@angular/forms';

import dedent from 'ts-dedent';

import { AgendaItemVisibility } from 'app/shared/models/agenda/agenda-item';
import { AssignmentPollMethod } from 'app/shared/models/assignments/assignment-poll';
import { Settings } from 'app/shared/models/event-management/meeting';
import { MotionWorkflow } from 'app/shared/models/motions/motion-workflow';
import { PercentBase } from 'app/shared/models/poll/base-poll';
import { AssignmentPollMethodVerbose } from 'app/site/assignments/models/view-assignment-poll';
import { MajorityMethodVerbose, PercentBaseVerbose, PollTypeVerbose } from 'app/site/polls/models/base-view-poll';

export type SettingsType =
    | 'string'
    | 'text'
    | 'markupText'
    | 'integer'
    | 'boolean'
    | 'choice'
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
export interface ChoicesFunctionDefinition {
    collection: string;
    idKey: string;
    labelKey: string;
}

export interface SettingsItem {
    key: keyof Settings;
    label: string;
    type?: SettingsType; // default: text
    choices?: ChoicesMap;
    // mandatory for type=choice; maps label <-> value
    choicesFunc?: ChoicesFunctionDefinition;
    // alternative to `choices`; overwrites `choices` if both are given
    default?: any;
    // If no default is given, it is set according to the type:
    // string/[markup]text: ""
    // boolean:             false
    // integer:             0
    // choice:              choices[0]
    // datetime:            null
    // groups/translations: []
    helpText?: string; // default: ""
    validators?: ValidatorFn[]; // default: []
}

export interface SettingsGroup {
    label: string;
    icon: string;
    subgroups: {
        label: string;
        settings: SettingsItem[];
    }[];
}

function switchKeyValue(object: { [key: string]: string }): { [key: string]: string } {
    return Object.entries(object).reduce((res, [key, value]) => {
        res[value] = key;
        return res;
    }, {});
}

export const meetingSettings: SettingsGroup[] = [
    {
        label: 'General',
        icon: 'home',
        subgroups: [
            {
                label: 'Event',
                settings: [
                    {
                        key: 'name',
                        label: 'Event name',
                        default: 'OpenSlides',
                        validators: [Validators.maxLength(100)]
                    },
                    {
                        key: 'description',
                        label: 'Short description of event',
                        default: 'Presentation and assembly system',
                        validators: [Validators.maxLength(100)]
                    },
                    {
                        key: 'start_time',
                        label: 'Event start date'
                    },
                    {
                        key: 'end_time',
                        label: 'Event end date'
                    },
                    {
                        key: 'location',
                        label: 'Event location'
                    }
                ]
            },
            {
                label: 'Live conference',
                settings: [
                    {
                        key: 'conference_show',
                        label: 'Show live conference window',
                        type: 'boolean',
                        helpText: 'Server settings required to activate Jitsi Meet integration.'
                    },
                    {
                        key: 'conference_auto_connect',
                        label: 'Connect all users to live conference automatically.',
                        type: 'boolean',
                        helpText: 'Server settings required to activate Jitsi Meet integration.'
                    },
                    {
                        key: 'conference_los_restriction',
                        label: 'Allow only current speakers and list of speakers managers to enter the live conference',
                        type: 'boolean',
                        helpText: 'Server settings required to activate Jitsi Meet integration.'
                    },
                    {
                        key: 'conference_stream_url',
                        label: 'Livestream url',
                        helpText: 'Remove URL to deactivate livestream. Check extra group permission to see livestream.'
                    }
                ]
            },
            {
                label: 'System',
                settings: [
                    {
                        key: 'url_name',
                        label: 'URL name'
                    },
                    {
                        key: 'is_template',
                        label: 'Use this as a template for other meetings',
                        type: 'boolean'
                    },
                    {
                        key: 'enable_anonymous',
                        label: 'Allow access for anonymous guest users',
                        type: 'boolean'
                    }
                ]
            },
            {
                label: 'Export',
                settings: [
                    {
                        key: 'export_csv_separator',
                        label: 'Separator used for all csv exports and examples',
                        default: ','
                    },
                    {
                        key: 'export_csv_encoding',
                        label: 'Default encoding for all csv exports',
                        default: 'utf-8',
                        type: 'choice',
                        choices: {
                            // matches ExportCsvEncoding
                            'UTF-8': 'utf-8',
                            'ISO-8859-15': 'iso-8859-15'
                        }
                    },
                    {
                        key: 'export_pdf_pagenumber_alignment',
                        label: 'Page number alignment in PDF',
                        default: 'center',
                        type: 'choice',
                        choices: {
                            Left: 'left',
                            Center: 'center',
                            Right: 'right'
                        }
                    },
                    {
                        key: 'export_pdf_fontsize',
                        label: 'Standard font size in PDF',
                        default: 10,
                        type: 'choice',
                        choices: {
                            10: 10,
                            11: 11,
                            12: 12
                        }
                    },
                    {
                        key: 'export_pdf_pagesize',
                        label: 'Standard page size in PDF',
                        default: 'A4',
                        type: 'choice',
                        choices: {
                            'DIN A4': 'A4',
                            'DIN A5': 'A5'
                        }
                    }
                ]
            }
        ]
    },
    {
        label: 'Agenda',
        icon: 'today',
        subgroups: [
            {
                label: 'General',
                settings: [
                    {
                        key: 'start_time',
                        label: 'Begin of event',
                        type: 'datetime',
                        helpText: 'Input format: DD.MM.YYYY HH:MM'
                    },
                    {
                        key: 'end_time', // not in code anymore
                        label: 'End of event',
                        type: 'datetime',
                        helpText: 'Input format: DD.MM.YYYY HH:MM'
                    },
                    {
                        key: 'agenda_show_subtitles',
                        label: 'Show subtitles in the agenda',
                        type: 'boolean'
                    }
                ]
            },
            {
                label: 'Numbering',
                settings: [
                    {
                        key: 'agenda_enable_numbering',
                        label: 'Show subtitles in the agenda',
                        default: true,
                        type: 'boolean'
                    },
                    {
                        key: 'agenda_number_prefix',
                        label: 'Numbering prefix for agenda items',
                        helpText: 'This prefix will be set if you run the automatic agenda numbering.',
                        validators: [Validators.maxLength(20)]
                    },
                    {
                        key: 'agenda_numeral_system',
                        label: 'Numeral system for agenda items',
                        default: 'arabic',
                        type: 'choice',
                        choices: {
                            Arabic: 'arabic',
                            Roman: 'roman'
                        }
                    }
                ]
            },
            {
                label: 'Visibility',
                settings: [
                    {
                        key: 'agenda_item_creation',
                        label: 'Add to agenda',
                        default: 'default_yes',
                        type: 'choice',
                        choices: {
                            // matches AgendaItemCreation
                            Always: 'always',
                            Never: 'never',
                            'Ask, default yes': 'default_yes',
                            'Ask, default no': 'default_no'
                        }
                    },
                    {
                        key: 'agenda_new_items_default_visibility',
                        label: 'Default visibility for new agenda items (except topics)',
                        default: AgendaItemVisibility.internal,
                        type: 'choice',
                        choices: {
                            'Public item': AgendaItemVisibility.common,
                            'Internal item': AgendaItemVisibility.internal,
                            'Hidden item': AgendaItemVisibility.hidden
                        }
                    },
                    {
                        key: 'agenda_show_internal_items_on_projector',
                        label: 'Show internal items when projecting subitems',
                        type: 'boolean'
                    }
                ]
            },
            {
                label: 'List of speakers',
                settings: [
                    {
                        key: 'list_of_speakers_amount_last_on_projector',
                        label: 'Number of last speakers to be shown on the projector',
                        type: 'integer',
                        validators: [Validators.min(0)]
                    },
                    {
                        key: 'list_of_speakers_amount_next_on_projector',
                        label: 'Number of the next speakers to be shown on the projector',
                        default: -1,
                        type: 'integer',
                        helpText: 'Enter number of the next shown speakers. Choose -1 to show all next speakers.',
                        validators: [Validators.min(-1)]
                    },
                    {
                        key: 'projector_countdown_warning_time',
                        label: 'Show orange countdown in the last x seconds of speaking time',
                        type: 'integer',
                        helpText: 'Enter duration in seconds. Choose 0 to disable warning color.',
                        validators: [Validators.min(0)]
                    },
                    {
                        key: 'projector_default_countdown_time',
                        label: 'Predefined seconds of new countdowns',
                        default: 60,
                        type: 'integer'
                    },
                    {
                        key: 'list_of_speakers_couple_countdown',
                        label: 'Couple countdown with the list of speakers',
                        default: true,
                        type: 'boolean',
                        helpText: '[Begin speech] starts the countdown, [End speech] stops the countdown.'
                    },
                    {
                        key: 'list_of_speakers_show_amount_of_speakers_on_slide',
                        label: 'Show the amount of speakers in subtitle of list of speakers slide',
                        default: true,
                        type: 'boolean'
                    },
                    {
                        key: 'list_of_speakers_present_users_only',
                        label: 'Only present participants can be added to the list of speakers',
                        type: 'boolean'
                    },
                    {
                        key: 'list_of_speakers_show_first_contribution',
                        label: 'Show hint »first speech« in the list of speakers management view',
                        type: 'boolean'
                    }
                ]
            }
        ]
    },
    {
        label: 'Motions',
        icon: 'assignment',
        subgroups: [
            {
                label: 'General',
                settings: [
                    {
                        key: 'motions_default_workflow_id',
                        label: 'Workflow of new motions',
                        default: 1,
                        type: 'choice',
                        choicesFunc: {
                            collection: MotionWorkflow.COLLECTION,
                            idKey: 'id',
                            labelKey: 'name'
                        }
                    },
                    {
                        key: 'motions_default_amendment_workflow_id',
                        label: 'Workflow of new amendments',
                        default: 1,
                        type: 'choice',
                        choicesFunc: {
                            collection: MotionWorkflow.COLLECTION,
                            idKey: 'id',
                            labelKey: 'name'
                        }
                    },
                    {
                        key: 'motions_default_statute_amendment_workflow_id',
                        label: 'Workflow of new statute amendments',
                        default: 1,
                        type: 'choice',
                        choicesFunc: {
                            collection: MotionWorkflow.COLLECTION,
                            idKey: 'id',
                            labelKey: 'name'
                        }
                    },
                    {
                        key: 'motions_preamble',
                        label: 'Motion preamble',
                        default: 'The assembly may decide:'
                    },
                    {
                        key: 'motions_default_line_numbering',
                        label: 'Default line numbering',
                        default: 'outside',
                        type: 'choice',
                        choices: {
                            // matches LineNumberingMode
                            outside: 'outside',
                            inline: 'inline',
                            Disabled: 'none'
                        }
                    },
                    {
                        key: 'motions_line_length',
                        label: 'Line length',
                        default: 85,
                        type: 'integer',
                        helpText:
                            'The maximum number of characters per line. Relevant when line numbering is enabled. Min: 40',
                        validators: [Validators.min(40)]
                    },
                    {
                        key: 'motions_reason_required',
                        label: 'Reason required for creating new motion',
                        type: 'boolean'
                    },
                    {
                        key: 'motions_enable_text_on_projector',
                        label: 'Show motion text on projector',
                        default: true,
                        type: 'boolean'
                    },
                    {
                        key: 'motions_enable_reason_on_projector',
                        label: 'Show reason on projector',
                        default: true,
                        type: 'boolean'
                    },
                    {
                        key: 'motions_enable_recommendation_on_projector',
                        label: 'Show recommendation on projector',
                        default: true,
                        type: 'boolean'
                    },
                    {
                        key: 'motions_show_referring_motions',
                        label: 'Show referring motions',
                        default: true,
                        type: 'boolean'
                    },
                    {
                        key: 'motions_enable_sidebox_on_projector',
                        label: 'Show meta information box below the title on projector',
                        type: 'boolean'
                    },
                    {
                        key: 'motions_show_sequential_number',
                        label: 'Show the sequential number for a motion',
                        default: true,
                        type: 'boolean'
                    },
                    {
                        key: 'motions_recommendations_by',
                        label: 'Name of recommender',
                        helpText:
                            'Will be displayed as label before selected recommendation. Use an empty value to disable the recommendation system.'
                    },
                    {
                        key: 'motions_statute_recommendations_by',
                        label: 'Name of recommender for statute amendments',
                        helpText: 'Will be displayed as label before selected recommendation in statute amendments.'
                    },
                    {
                        key: 'motions_recommendation_text_mode',
                        label: 'Default text version for change recommendations',
                        default: 'diff',
                        type: 'choice',
                        choices: {
                            // matches ChangeRecoMode
                            'Original version': 'original',
                            'Changed version': 'changed',
                            'Diff version': 'diff',
                            'Final version': 'agreed'
                        }
                    },
                    {
                        key: 'motions_default_sorting',
                        label: 'Sort motions by',
                        default: 'number',
                        type: 'choice',
                        choices: {
                            'Call list': 'weight',
                            number: 'number'
                        }
                    }
                ]
            },
            {
                label: 'Numbering',
                settings: [
                    {
                        key: 'motions_number_type',
                        label: 'Number',
                        default: 'per_category',
                        type: 'choice',
                        choices: {
                            'Numbered per category': 'per_category',
                            'Serially numbered': 'serially_numbered',
                            'Set it manually': 'manually'
                        }
                    },
                    {
                        key: 'motions_number_min_digits',
                        label: 'Number of minimal digits for number',
                        default: 1,
                        type: 'integer',
                        helpText: 'Uses leading zeros to sort motions correctly by number.',
                        validators: [Validators.min(1)]
                    },
                    {
                        key: 'motions_number_with_blank',
                        label: 'Allow blank in number',
                        type: 'boolean',
                        helpText: "Blank between prefix and number, e.g. 'A 001'."
                    }
                ]
            },
            {
                label: 'Amendments',
                settings: [
                    {
                        key: 'motions_statutes_enabled',
                        label: 'Activate statute amendments',
                        type: 'boolean'
                    },
                    {
                        key: 'motions_amendments_enabled',
                        label: 'Activate amendments',
                        type: 'boolean'
                    },
                    {
                        key: 'motions_amendments_in_main_list',
                        label: 'Show amendments together with motions',
                        default: true,
                        type: 'boolean'
                    },
                    {
                        key: 'motions_amendments_of_amendments',
                        label: 'Allow amendments of amendments',
                        type: 'boolean'
                    },
                    {
                        key: 'motions_amendments_prefix',
                        label: 'Prefix for the number for amendments',
                        default: '-'
                    },
                    {
                        key: 'motions_amendments_text_mode',
                        label: 'How to create new amendments',
                        default: 'paragraph',
                        type: 'choice',
                        choices: {
                            'Empty text field': 'freestyle',
                            'Edit the whole motion text': 'fulltext',
                            'Paragraph-based, Diff-enabled': 'paragraph'
                        }
                    },
                    {
                        key: 'motions_amendments_multiple_paragraphs',
                        label: 'Amendments can change multiple paragraphs',
                        default: true,
                        type: 'boolean'
                    }
                ]
            },
            {
                label: 'Supporters',
                settings: [
                    {
                        key: 'motions_supporters_min_amount',
                        label: 'Number of (minimum) required supporters for a motion',
                        type: 'integer',
                        helpText: 'Choose 0 to disable the supporting system.',
                        validators: [Validators.min(0)]
                    }
                ]
            },
            {
                label: 'Voting and ballot papers',
                settings: [
                    {
                        key: 'motion_poll_default_type',
                        label: 'Default voting type',
                        type: 'choice',
                        choices: switchKeyValue(PollTypeVerbose)
                    },
                    {
                        key: 'motion_poll_default_100_percent_base',
                        label: 'Default 100 % base of a voting result',
                        default: PercentBase.YNA,
                        type: 'choice',
                        choices: switchKeyValue(PercentBaseVerbose)
                    },
                    {
                        key: 'motion_poll_default_majority_method',
                        label: 'Required majority',
                        type: 'choice',
                        choices: switchKeyValue(MajorityMethodVerbose),
                        helpText: 'Default method to check whether a motion has reached the required majority.'
                    },
                    {
                        key: 'motion_poll_default_group_ids',
                        label: 'Default groups with voting rights',
                        default: [],
                        type: 'groups'
                    },
                    {
                        key: 'motion_poll_ballot_paper_selection',
                        label: 'Number of ballot papers',
                        default: 'CUSTOM_NUMBER',
                        type: 'choice',
                        choices: {
                            'Number of all delegates': 'NUMBER_OF_DELEGATES',
                            'Number of all participants': 'NUMBER_OF_ALL_PARTICIPANTS',
                            'Use the following custom number': 'CUSTOM_NUMBER'
                        }
                    },
                    {
                        key: 'motion_poll_ballot_paper_number',
                        label: 'Custom number of ballot papers',
                        default: 8,
                        type: 'integer',
                        validators: [Validators.min(1)]
                    }
                ]
            },
            {
                label: 'PDF export',
                settings: [
                    {
                        key: 'motions_export_title',
                        label: 'Title for PDF documents of motions',
                        default: 'Motions'
                    },
                    {
                        key: 'motions_export_preamble',
                        label: 'Preamble text for PDF documents of motions'
                    },
                    {
                        key: 'motions_export_submitter_recommendation',
                        label: 'Show submitters and recommendation/state in table of contents',
                        type: 'boolean'
                    },
                    {
                        key: 'motions_export_follow_recommendation',
                        label: 'Show checkbox to record decision',
                        type: 'boolean'
                    }
                ]
            }
        ]
    },
    {
        label: 'Elections',
        icon: 'how_to_vote',
        subgroups: [
            {
                label: 'Ballot',
                settings: [
                    {
                        key: 'assignment_poll_default_method',
                        label: 'Default election method',
                        default: AssignmentPollMethod.Votes,
                        type: 'choice',
                        choices: switchKeyValue(AssignmentPollMethodVerbose)
                    },
                    {
                        key: 'assignment_poll_default_type',
                        label: 'Default voting type',
                        type: 'choice',
                        choices: switchKeyValue(PollTypeVerbose)
                    },
                    {
                        key: 'assignment_poll_default_100_percent_base',
                        label: 'Default 100 % base of an election result',
                        default: PercentBase.Valid,
                        type: 'choice',
                        choices: switchKeyValue(PercentBaseVerbose)
                    },
                    {
                        key: 'assignment_poll_default_majority_method',
                        label: 'Required majority',
                        type: 'choice',
                        choices: switchKeyValue(MajorityMethodVerbose),
                        helpText: 'Default method to check whether a candidate has reached the required majority.'
                    },
                    {
                        key: 'assignment_poll_default_group_ids',
                        label: 'Default groups with voting rights',
                        type: 'groups'
                    },
                    {
                        key: 'assignment_poll_add_candidates_to_list_of_speakers',
                        label: 'Put all candidates on the list of speakers',
                        default: true,
                        type: 'boolean'
                    },
                    {
                        key: 'assignment_poll_sort_poll_result_by_votes',
                        label: 'Sort election results by amount of votes',
                        default: true,
                        type: 'boolean'
                    }
                ]
            },
            {
                label: 'Ballot papers',
                settings: [
                    {
                        key: 'assignment_poll_ballot_paper_selection',
                        label: 'Number of ballot papers',
                        default: 'CUSTOM_NUMBER',
                        type: 'choice',
                        choices: {
                            'Number of all delegates': 'NUMBER_OF_DELEGATES',
                            'Number of all participants': 'NUMBER_OF_ALL_PARTICIPANTS',
                            'Use the following custom number': 'CUSTOM_NUMBER'
                        }
                    },
                    {
                        key: 'assignment_poll_ballot_paper_number',
                        label: 'Custom number of ballot papers',
                        default: 8,
                        type: 'integer',
                        validators: [Validators.min(1)]
                    }
                ]
            },
            {
                label: 'PDF export',
                settings: [
                    {
                        key: 'assignments_export_title',
                        label: 'Title for PDF document (all elections)',
                        default: 'Elections'
                    },
                    {
                        key: 'assignments_export_preamble',
                        label: 'Preamble text for PDF document (all elections)'
                    }
                ]
            }
        ]
    },
    {
        label: 'Participants',
        icon: 'groups',
        subgroups: [
            {
                label: 'General',
                settings: [
                    {
                        key: 'users_sort_by',
                        label: 'Sort name of participants by',
                        default: 'first_name',
                        type: 'choice',
                        choices: {
                            // matches UserSortProperty
                            'Given name': 'first_name',
                            Surname: 'last_name',
                            'Participant number': 'number'
                        }
                    },
                    {
                        key: 'users_enable_presence_view',
                        label: 'Enable participant presence view',
                        type: 'boolean'
                    },
                    {
                        key: 'users_allow_self_set_present',
                        label: 'Allow users to set themselves as present',
                        type: 'boolean',
                        helpText: 'e.g. for online meetings'
                    },
                    {
                        key: 'users_enable_vote_weight',
                        label: 'Activate vote weight',
                        type: 'boolean'
                    }
                ]
            },
            {
                label: 'PDF export',
                settings: [
                    {
                        key: 'users_pdf_welcometitle',
                        label: 'Title for access data and welcome PDF',
                        default: 'Welcome to OpenSlides'
                    },
                    {
                        key: 'users_pdf_welcometext',
                        label: 'Help text for access data and welcome PDF',
                        default: '[Place for your welcome and help text.]'
                    },
                    {
                        key: 'users_pdf_url',
                        label: 'System URL',
                        default: 'http://example.com:8000',
                        helpText: 'Used for QRCode in PDF of access data.'
                    },
                    {
                        key: 'users_pdf_wlan_ssid',
                        label: 'WLAN name (SSID)',
                        helpText: 'Used for WLAN QRCode in PDF of access data.'
                    },
                    {
                        key: 'users_pdf_wlan_password',
                        label: 'WLAN password',
                        helpText: 'Used for WLAN QRCode in PDF of access data.'
                    },
                    {
                        key: 'users_pdf_wlan_encryption',
                        label: 'WLAN encryption',
                        type: 'choice',
                        helpText: 'Used for WLAN QRCode in PDF of access data.',
                        choices: {
                            '---------': '',
                            WEP: 'WEP',
                            'WPA/WPA2': 'WPA',
                            'No encryption': 'nopass'
                        }
                    }
                ]
            },
            {
                label: 'Email',
                settings: [
                    {
                        key: 'users_email_sender',
                        label: 'Sender name',
                        default: 'OpenSlides',
                        helpText:
                            'The sender address is defined in the OpenSlides server settings and should modified by administrator only.'
                    },
                    {
                        key: 'users_email_replyto',
                        label: 'Reply address'
                    },
                    {
                        key: 'users_email_subject',
                        label: 'Email subject',
                        default: 'OpenSlides access data',
                        helpText: 'You can use {event_name} and {username} as placeholder.'
                    },
                    {
                        key: 'users_email_body',
                        label: 'Email body',
                        default: dedent`
                            Dear {name},

                            this is your personal OpenSlides login:

                                {url}
                                username: {username}
                                password: {password}

                            This email was generated automatically.`,
                        type: 'text',
                        helpText:
                            'Use these placeholders: {name}, {event_name}, {url}, {username}, {password}. The url referrs to the system url.'
                    }
                ]
            }
        ]
    },
    {
        label: 'Custom translations',
        icon: 'language',
        subgroups: [
            {
                label: 'Custom translations',
                settings: [
                    {
                        key: 'custom_translations',
                        label: 'Custom translations',
                        type: 'translations'
                    }
                ]
            }
        ]
    }
];
