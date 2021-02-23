import { AgendaItemType } from '../agenda/agenda-item';
import { Id } from 'app/core/definitions/key-types';
import { ChangeRecoMode, LineNumberingMode } from 'app/site/motions/motions.constants';
import { AssignmentPollMethod, AssignmentPollPercentBase } from '../assignments/assignment-poll';
import { BaseModel } from '../base/base-model';
import { MajorityMethod, PercentBase, PollType } from '../poll/base-poll';
import { HasProjectionIds } from '../base/has-projectable-ids';

export type UserSortProperty = 'first_name' | 'last_name' | 'number';
export type ExportCsvEncoding = 'utf-8' | 'iso-8859-15';
export type AgendaItemCreation = 'always' | 'never' | 'default_yes' | 'default_no';

/**
 * Server side ballot choice definitions.
 * Server-defined methods to determine the number of ballots to print
 * Options are:
 * - NUMBER_OF_DELEGATES Amount of users belonging to the predefined 'delegates' group (group id 2)
 * - NUMBER_OF_ALL_PARTICIPANTS The amount of all registered users
 * - CUSTOM_NUMBER a given number of ballots
 */
export type BallotPaperSelection = 'NUMBER_OF_DELEGATES' | 'NUMBER_OF_ALL_PARTICIPANTS' | 'CUSTOM_NUMBER';

export interface Settings {
    // Old "general_*" configs
    name: string;
    description: string;
    location: string;
    start_time: number;
    end_time: number;
    welcome_title: string;
    welcome_text: string;
    custom_translations: {
        [original: string]: string;
    };

    // TODO: Move to meeting. these are not setrtings anymore, if the meeting-detail-view
    // in the committee-list-view is finished.
    url_name: string; // For unique urls.
    is_template: boolean; // Unique within a committee
    enable_anonymous: boolean;

    // Jitsi/Livestream settings
    conference_show: boolean;
    conference_auto_connect: boolean;
    conference_los_restriction: boolean;
    conference_stream_url: string;

    // Projector
    projector_default_countdown_time: number;
    projector_countdown_warning_time: number;

    // Exports
    export_csv_encoding: ExportCsvEncoding;
    export_csv_separator: string;
    export_pdf_pagenumber_alignment: string;
    export_pdf_fontsize: number;
    export_pdf_pagesize: string;

    // Agenda
    agenda_show_subtitles: boolean;
    agenda_enable_numbering: boolean;
    agenda_number_prefix: string;
    agenda_numeral_system: string;
    agenda_item_creation: AgendaItemCreation;
    agenda_new_items_default_visibility: AgendaItemType;
    agenda_show_internal_items_on_projector: boolean;

    // List of speakers
    list_of_speakers_amount_last_on_projector: number;
    list_of_speakers_amount_next_on_projector: boolean;
    list_of_speakers_couple_countdown: boolean;
    list_of_speakers_show_amount_of_speakers_on_slide: boolean;
    list_of_speakers_present_users_only: boolean;
    list_of_speakers_show_first_contribution: boolean;
    list_of_speakers_enable_point_of_order_speakers: boolean;

    // Motions
    motions_default_workflow_id: Id; // workflow/default_workflow_meeting_id;
    motions_default_amendment_workflow_id: Id; // workflow/default_amendment_workflow_meeting_id;
    motions_default_statute_amendment_workflow_id: Id; // workflow/default_statute_amendment_workflow_meeting_id;
    motions_preamble: string;
    motions_default_line_numbering: LineNumberingMode;
    motions_line_length: number;
    motions_reason_required: boolean;
    motions_enable_text_on_projector: boolean;
    motions_enable_reason_on_projector: boolean;
    motions_enable_sidebox_on_projector: boolean;
    motions_enable_recommendation_on_projector: boolean;
    motions_show_referring_motions: boolean;
    motions_show_sequential_number: boolean;
    motions_recommendations_by: string;
    motions_statute_recommendations_by: string;
    motions_recommendation_text_mode: ChangeRecoMode;
    motions_default_sorting: string;
    motions_number_type: string;
    motions_number_min_digits: number;
    motions_number_with_blank: boolean;
    motions_statutes_enabled: boolean;
    motions_amendments_enabled: boolean;
    motions_amendments_in_main_list: boolean;
    motions_amendments_of_amendments: boolean;
    motions_amendments_prefix: string;
    motions_amendments_text_mode: string;
    motions_amendments_multiple_paragraphs: boolean;
    motions_supporters_min_amount: number;
    motions_export_title: string;
    motions_export_preamble: string;
    motions_export_submitter_recommendation: boolean;
    motions_export_follow_recommendation: boolean;

    motion_poll_ballot_paper_selection: BallotPaperSelection;
    motion_poll_ballot_paper_number: number;
    motion_poll_default_type: PollType;
    motion_poll_default_100_percent_base: PercentBase;
    motion_poll_default_majority_method: MajorityMethod;
    motion_poll_default_group_ids: Id[]; // (group/used_as_motion_poll_default_id)[];

    // Users
    users_sort_by: UserSortProperty;
    users_enable_presence_view: boolean;
    users_enable_vote_weight: boolean;
    users_allow_self_set_present: boolean;
    users_pdf_welcometitle: string;
    users_pdf_welcometext: string;
    users_pdf_url: string;
    users_pdf_wlan_ssid: string;
    users_pdf_wlan_password: string;
    users_pdf_wlan_encryption: string;
    users_email_sender: string;
    users_email_replyto: string;
    users_email_subject: string;
    users_email_body: string;

    // Assignments
    assignments_export_title: string;
    assignments_export_preamble: string;

    assignment_poll_ballot_paper_selection: BallotPaperSelection;
    assignment_poll_ballot_paper_number: number;
    assignment_poll_add_candidates_to_list_of_speakers: boolean;
    assignment_poll_sort_poll_result_by_votes: boolean;
    assignment_poll_default_type: PollType;
    assignment_poll_default_method: AssignmentPollMethod;
    assignment_poll_default_100_percent_base: AssignmentPollPercentBase;
    assignment_poll_default_majority_method: MajorityMethod;
    assignment_poll_default_group_ids: Id[]; // (group/used_as_assignment_poll_default_id)[];
}

export class Meeting extends BaseModel<Meeting> {
    public static COLLECTION = 'meeting';

    public id: Id;

    public projector_ids: Id[]; // (projector/meeting_id)[];
    public all_projection_ids: Id[]; // (projection/meeting_id)[];
    public projector_message_ids: Id[]; // (projector_message/meeting_id)[];
    public projector_countdown_ids: Id[]; // (projector_countdown/meeting_id)[];
    public tag_ids: Id[]; // (tag/meeting_id)[];
    public agenda_item_ids: Id[]; // (agenda_item/meeting_id)[];
    public list_of_speakers_ids: Id[]; // (list_of_speakers/meeting_id)[];
    public speaker_ids: Id[]; // (speaker/meeting_id)[];
    public topic_ids: Id[]; // (topic/meeting_id)[];
    public group_ids: Id[]; // (group/meeting_id)[];
    public personal_note_ids: Id[]; // (personal_note/meeting_id)[];
    public mediafile_ids: Id[]; // (mediafile/meeting_id)[];
    public motion_ids: Id[]; // (motion/meeting_id)[];
    public motion_comment_section_ids: Id[]; // (motion_comment_section/meeting_id)[];
    public motion_comment_ids: Id[]; // (motion_comment/meeting_id)[];
    public motion_category_ids: Id[]; // (motion_category/meeting_id)[];
    public motion_block_ids: Id[]; // (motion_block/meeting_id)[];
    public motion_submitter_ids: Id[]; // (motion_submitter/meeting_id)[];
    public motion_change_recommendation_ids: Id[]; // (motion_change_recommendation/meeting_id)[];
    public motion_workflow_ids: Id[]; // (motion_workflow/meeting_id)[];
    public motion_state_ids: Id[]; // (motion_state/meeting_id)[];
    public motion_statute_paragraph_ids: Id[]; // (motion_statute_paragraph/meeting_id)[];
    public motion_poll_ids: Id[]; // (motion_poll/meeting_id)[];
    public motion_option_ids: Id[]; // (motion_option/meeting_id)[];
    public motion_vote_ids: Id[]; // (motion_vote/meeting_id)[];
    public assignment_ids: Id[]; // (assignment/meeting_id)[];
    public assignment_candidate_ids: Id[]; // (assignment_candidate/meeting_id)[];
    public assignment_poll_ids: Id[]; // (assignment_poll/meeting_id)[];
    public assignment_option_ids: Id[]; // (assignment_option/meeting_id)[];
    public assignment_vote_ids: Id[]; // (assignment_vote/meeting_id)[];

    // Logos and Fonts
    public logo_$_id: string[]; // mediafile/used_as_logo_$<place>_in_meeting_id;
    public font_$_id: string[]; // mediafile/used_as_font_$<place>_in_mmeting_id;

    // Other relations
    public committee_id: Id; // committee/meeting_ids;
    public default_meeting_for_committee_id: Id; // committee/default_meeting_id;
    public present_user_ids: Id[]; // (user/is_present_in_meeting_ids)[];
    public temporary_user_ids: Id[]; // (user/meeting_id)[];
    public guest_ids: Id[]; // (user/guest_meeting_ids)[];
    public user_ids: Id[]; // Calculated: All ids from temporary_user_ids, guest_ids and all users assigned to groups.
    public reference_projector_id: Id; // projector/used_as_reference_projector_meeting_id;
    public default_projector_$_id: string[]; // projector/used_as_default_$_in_meeting_id;

    public default_group_id: Id; // group/default_group_for_meeting_id;
    public admin_group_id: Id; // group/admin_group_for_meeting_id;

    public constructor(input?: any) {
        super(Meeting.COLLECTION, input);
    }

    public logo_id(place: string): Id | null {
        return this[`logo_$${place}_id`] || null;
    }

    public font_id(place: string): Id | null {
        return this[`font_$${place}_id`] || null;
    }

    public default_projector_id(place: string): Id | null {
        return this[`default_projector_$${place}_id`] || null;
    }
}
export interface Meeting extends Settings, HasProjectionIds {}
