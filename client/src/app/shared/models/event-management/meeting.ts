import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

export class Meeting extends BaseModel<Meeting> {
    public static COLLECTION = 'meeting';

    public id: Id;
    public url_name: string; // For unique urls.
    public is_template: boolean; // Unique within a committee
    public enable_anonymous: boolean;

    // Old "general_*" configs
    public name: string;
    public description: string;
    public location: string;
    public start_time: number;
    public end_time: number;
    public welcome_title: string;
    public welcome_text: string;
    public custom_translations: {
        [original: string]: string;
    };

    // Projector
    public projector_default_countdown_time: number;
    public projector_countdown_warning_time: number;

    // Exports
    public export_csv_encoding: string;
    public export_csv_separator: string;
    public export_pdf_pagenumber_alignment: string;
    public export_pdf_fontsize: number;
    public export_pdf_pagesize: string;

    // Agenda
    public agenda_show_subtitles: boolean;
    public agenda_enable_numbering: boolean;
    public agenda_number_prefix: string;
    public agenda_numeral_system: string;
    public agenda_item_creation: string;
    public agenda_new_items_default_visibility: number;
    public agenda_show_internal_items_on_projector: boolean;

    // List of speakers
    public list_of_speakers_amount_last_on_projector: number;
    public list_of_speakers_amount_next_on_projector: boolean;
    public list_of_speakers_couple_countdown: boolean;
    public list_of_speakers_show_amount_of_speakers_on_slide: boolean;
    public list_of_speakers_present_users_only: boolean;

    // Motions
    public motions_default_workflow_id: Id; // workflow/default_workflow_meeting_id;
    public motions_default_statute_amendments_workflow_id: Id; // workflow/default_statute_amendments_meeting_id;
    public motions_preamble: string;
    public motions_default_line_numbering: string;
    public motions_line_length: number;
    public motions_reason_required: boolean;
    public motions_enable_text_on_projector: boolean;
    public motions_enable_reason_on_projector: boolean;
    public motions_enable_sidebox_on_projector: boolean;
    public motions_enable_recommendation_on_projector: boolean;
    public motions_show_referring_motions: boolean;
    public motions_show_sequential_number: boolean;
    public motions_recommendations_by: string;
    public motions_statute_recommendations_by: string;
    public motions_recommendation_text_mode: string;
    public motions_default_sorting: string;
    public motions_identifier_type: string;
    public motions_identifier_min_digits: number;
    public motions_identifier_with_blank: boolean;
    public motions_statutes_enabled: boolean;
    public motions_amendments_enabled: boolean;
    public motions_amendments_in_main_list: boolean;
    public motions_amendments_of_amendments: boolean;
    public motions_amendments_prefix: string;
    public motions_amendments_text_mode: string;
    public motions_amendments_multiple_paragraphs: boolean;
    public motions_supporters_min_amount: number;
    public motions_supporters_enable_autoremove: boolean;
    public motions_export_title: string;
    public motions_export_preamble: string;
    public motions_export_submitter_recommendation: boolean;
    public motions_export_follow_recommendation: boolean;

    public motion_poll_ballot_paper_selection: string;
    public motion_poll_ballot_paper_number: number;
    public motion_poll_default_100_percent_base: string;
    public motion_poll_default_majority_method: string;
    public motion_poll_default_group_ids: Id[]; // (group/used_as_motion_poll_default_id)[];

    // Users
    public users_sort_by: string;
    public users_enable_presence_view: boolean;
    public users_enable_vote_weight: boolean;
    public users_allow_self_set_present: boolean;
    public users_pdf_welcometitle: string;
    public users_pdf_welcometext: string;
    public users_pdf_url: string;
    public users_pdf_wlan_ssid: string;
    public users_pdf_wlan_password: string;
    public users_pdf_wlan_encryption: string;
    public users_email_sender: string;
    public users_email_replyto: string;
    public users_email_subject: string;
    public users_email_body: string;

    // Assignments
    public assignments_export_title: string;
    public assignments_export_preamble: string;
    public assignment_poll_add_candidates_to_list_of_speakers: boolean;
    public assignment_poll_sort_poll_result_by_votes: boolean;
    public assignment_poll_default_method: string;
    public assignment_poll_default_100_percent_base: string;
    public assignment_poll_default_majority_method: string;
    public assignment_poll_default_group_ids: Id[]; // (group/used_as_assignment_poll_default_id)[];

    public projector_ids: Id[]; // (projector/meeting_id)[];
    public projectiondefault_ids: Id[]; // (projectiondefault/meeting_id)[];
    public projector_message_ids: Id[]; // (projector_message/meeting_id)[];
    public projector_countdown_ids: Id[]; // (projector_countdown/meeting_id)[];
    public tag_ids: Id[]; // (tag/meeting_id)[];
    public agenda_item_ids: Id[]; // (agenda_item/meeting_id)[];
    public list_of_speakers_ids: Id[]; // (list_of_speakers/meeting_id)[];
    public topic_ids: Id[]; // (topic/meeting_id)[];
    public group_ids: Id[]; // (group/meeting_id)[];
    public mediafile_ids: Id[]; // (mediafile/meeting_id)[];
    public motion_ids: Id[]; // (motion/meeting_id)[];
    public motion_comment_section_ids: Id[]; // (motion_comment_section/meeting_id)[];
    public motion_category_ids: Id[]; // (motion_category/meeting_id)[];
    public motion_block_ids: Id[]; // (block/meeting_id)[];
    public motion_workflow_ids: Id[]; // (motion_workflow/meeting_id)[];
    public motion_statute_paragraph_ids: Id[]; // (motion_statute_paragraph/meeting_id)[];
    public motion_poll_ids: Id[]; // (motion_poll/meeting_id)[];
    public assignment_ids: Id[]; // (assignment/meeting_id)[];
    public assignment_poll_ids: Id[]; // (assignment_poll/meeting_id)[];

    // Logos and Fonts
    public logo_$: string[]; // mediafile/logo_$<token>;
    public font_$: string[]; // mediafile/font_$<token>;

    // Other relations
    public committee_id: Id; // committee/meeting_ids;
    public default_meeting_for_committee_id: Id; // committee/default_meeting_id;
    public present_user_ids: Id[]; // (user/is_present_in_meeting_ids)[];
    public temporary_user_ids: Id[]; // (user/meeting_id)[];
    public guest_ids: Id[]; // (user/guest_meeting_ids)[];
    public reference_projector_id: Id; // projector/used_as_reference_projector_meeting_id;

    public constructor(input?: any) {
        super(Meeting.COLLECTION, input);
    }
}
