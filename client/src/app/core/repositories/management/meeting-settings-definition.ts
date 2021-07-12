import { ValidatorFn, Validators } from '@angular/forms';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import dedent from 'ts-dedent';

import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { AgendaItemType } from 'app/shared/models/agenda/agenda-item';
import { Settings } from 'app/shared/models/event-management/meeting';
import { MotionWorkflow } from 'app/shared/models/motions/motion-workflow';
import { PollPercentBase } from 'app/shared/models/poll/poll-constants';
import {
    AssignmentPollMethodVerbose,
    PollPercentBaseVerbose,
    PollTypeVerbose
} from 'app/shared/models/poll/poll-constants';

export type SettingsType =
    | 'string'
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
    // mandatory for type=choice; maps value <-> label
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
    /**
     * A function to restrict some values of a settings-item depending on used organization's settings
     *
     * @param orgaSettings: The `OrganizationSettingsService` has to be passed, because it is not injected in the
     * settings definitions
     * @param value: The value used...
     */
    restrictionFn?: <T>(orgaSettings: OrganizationSettingsService, value: T) => T;
}

export interface SettingsGroup {
    label: string;
    icon: string;
    subgroups: {
        label: string;
        settings: SettingsItem[];
    }[];
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
                label: 'Projector',
                settings: [
                    {
                        key: 'projector_countdown_warning_time',
                        label: 'Show orange countdown in the last x seconds of speaking time',
                        type: 'integer',
                        helpText: 'Enter duration in seconds. Choose 0 to disable warning color.',
                        validators: [Validators.min(0)]
                    },
                    {
                        key: 'projector_countdown_default_time',
                        label: 'Predefined seconds of new countdowns',
                        default: 60,
                        type: 'integer'
                    }
                ]
            },
            {
                label: 'System',
                settings: [
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
                            'utf-8': _('UTF-8'),
                            'iso-8859-15': _('ISO-8859-15')
                        }
                    },
                    {
                        key: 'export_pdf_pagenumber_alignment',
                        label: 'Page number alignment in PDF',
                        default: 'center',
                        type: 'choice',
                        choices: {
                            left: _('Left'),
                            center: _('Center'),
                            right: _('Right')
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
                            A4: _('DIN A4'),
                            A5: _('DIN A5')
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
                        type: 'date',
                        helpText: 'Input format: DD.MM.YYYY'
                    },
                    {
                        key: 'end_time', // not in code anymore
                        label: 'End of event',
                        type: 'date',
                        helpText: 'Input format: DD.MM.YYYY'
                    },
                    {
                        key: 'agenda_show_subtitles',
                        label: 'Show motion submitters in the agenda',
                        type: 'boolean'
                    }
                ]
            },
            {
                label: 'Numbering',
                settings: [
                    {
                        key: 'agenda_enable_numbering',
                        label: 'Enable numbering for agenda items',
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
                            arabic: _('Arabic'),
                            roman: _('Roman')
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
                            always: _('Always'),
                            never: _('Never'),
                            default_yes: _('Ask, default yes'),
                            default_no: _('Ask, default no')
                        }
                    },
                    {
                        key: 'agenda_new_items_default_visibility',
                        label: 'Default visibility for new agenda items (except topics)',
                        default: AgendaItemType.internal,
                        type: 'choice',
                        choices: {
                            [AgendaItemType.common]: _('Public item'),
                            [AgendaItemType.internal]: _('Internal item'),
                            [AgendaItemType.hidden]: _('Hidden item')
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
                        key: 'list_of_speakers_couple_countdown',
                        label: 'Couple countdown with the list of speakers',
                        default: true,
                        type: 'boolean',
                        helpText: '[Begin speech] starts the countdown, [End speech] stops the countdown.'
                    },
                    {
                        key: 'list_of_speakers_enable_point_of_order_speakers',
                        label: 'Enable point of order',
                        default: false,
                        type: 'boolean'
                    },
                    {
                        key: 'list_of_speakers_speaker_note_for_everyone',
                        label:
                            'Everyone can see the request of a point of order (instead of managers for list of speakers only)',
                        type: 'boolean',
                        default: false
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
                        type: 'boolean',
                        default: false
                    },
                    {
                        key: 'list_of_speakers_show_first_contribution',
                        label: 'Show hint »first speech« in the list of speakers management view',
                        type: 'boolean',
                        default: false
                    },
                    {
                        key: 'list_of_speakers_initially_closed',
                        label: 'List of speakers is initially closed',
                        type: 'boolean',
                        default: false
                    },
                    {
                        key: 'list_of_speakers_enable_pro_contra_speech',
                        label: 'Enable forspeech / counter speech',
                        type: 'boolean',
                        default: true
                    },
                    {
                        key: 'list_of_speakers_can_set_contribution_self',
                        label: 'Enable star icon to mark speaker (e.g. for contribution)',
                        type: 'boolean',
                        default: false
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
                            outside: _('outside'),
                            inline: _('inline'),
                            none: _('Disabled')
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
                            original: _('Original version'),
                            changed: _('Changed version'),
                            diff: _('Diff version'),
                            agreed: _('Final version')
                        }
                    },
                    {
                        key: 'motions_default_sorting',
                        label: 'Sort motions by',
                        default: 'number',
                        type: 'choice',
                        choices: {
                            weight: _('Call list'),
                            number: _('number')
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
                            per_category: _('Numbered per category'),
                            serially_numbered: _('Serially numbered'),
                            manually: _('Set it manually')
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
                            freestyle: _('Empty text field'),
                            fulltext: _('Edit the whole motion text'),
                            paragraph: _('Paragraph-based, Diff-enabled')
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
                        choices: PollTypeVerbose,
                        restrictionFn: (orgaSettings, value: any) => {
                            const isElectronicVotingEnabled = orgaSettings.instant('enable_electronic_voting');
                            if (!isElectronicVotingEnabled && typeof value !== 'string') {
                                return { analog: 'analog' };
                            }
                            return value;
                        }
                    },
                    {
                        key: 'motion_poll_default_100_percent_base',
                        label: 'Default 100 % base of a voting result',
                        default: PollPercentBase.YNA,
                        type: 'choice',
                        choices: PollPercentBaseVerbose
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
                            NUMBER_OF_DELEGATES: _('Number of all delegates'),
                            NUMBER_OF_ALL_PARTICIPANTS: _('Number of all participants'),
                            CUSTOM_NUMBER: _('Use the following custom number')
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
                        type: 'choice',
                        choices: AssignmentPollMethodVerbose
                    },
                    {
                        key: 'assignment_poll_default_type',
                        label: 'Default voting type',
                        type: 'choice',
                        choices: PollTypeVerbose,
                        restrictionFn: (orgaSettings, value: any) => {
                            const isElectronicVotingEnabled = orgaSettings.instant('enable_electronic_voting');
                            if (!isElectronicVotingEnabled && typeof value !== 'string') {
                                return { analog: 'analog' };
                            }
                            return value;
                        }
                    },
                    {
                        key: 'assignment_poll_default_100_percent_base',
                        label: 'Default 100 % base of an election result',
                        default: PollPercentBase.Valid,
                        type: 'choice',
                        choices: PollPercentBaseVerbose
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
                            NUMBER_OF_DELEGATES: _('Number of all delegates'),
                            NUMBER_OF_ALL_PARTICIPANTS: _('Number of all participants'),
                            CUSTOM_NUMBER: _('Use the following custom number')
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
                            first_name: _('Given name'),
                            last_name: _('Surname'),
                            number: _('Participant number')
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
                            '': '---------',
                            WEP: 'WEP',
                            WPA: 'WPA/WPA2',
                            nopass: 'No encryption'
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
