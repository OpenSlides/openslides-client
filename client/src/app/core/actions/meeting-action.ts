import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace MeetingAction {
    export const CREATE = 'meeting.create';
    export const UPDATE = 'meeting.update';
    export const DELETE = 'meeting.delete';
    export const CREATE_FROM_TEMPLATE = 'meeting.create_from_template';
    export const DELETE_ALL_SPEAKERS_OF_ALL_LISTS = 'meeting.delete_all_speakers_of_all_lists';

    export interface CreatePayload {
        // Required
        committee_id: Id;
        name: string;
        welcome_title: string;

        // Optional, modified the template_for_committee_id relation
        set_as_template: boolean;

        // Optional
        welcome_text?: UnsafeHtml;
        description?: string;
        location?: string;
        start_time?: Date;
        end_time?: Date;
        url_name?: string;
        enable_anonymous?: boolean;
        guest_ids?: Id[];
    }
    export interface CreateFromTemplatePayload {
        committee_id: Id;
    }
    export interface UpdatePayload {
        // Optional
        welcome_title: string;
        welcome_text: UnsafeHtml;

        // General
        name: string;
        description: string;
        location: string;
        start_time: Date;
        end_time: Date;
        custom_translations: JSON;

        // System
        url_name: string;
        template_for_committee_id: Id;
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
        export_csv_encoding: string;
        export_csv_separator: string;
        export_pdf_pagenumber_alignment: string;
        export_pdf_fontsize: number;
        export_pdf_pagesize: string;

        // Agenda
        agenda_show_subtitles: boolean;
        agenda_enable_numbering: boolean;
        agenda_number_prefix: string;
        agenda_numeral_system: string;
        agenda_item_creation: string;
        agenda_new_items_default_visibility: number;
        agenda_show_internal_items_on_projector: boolean;

        // List of speakers
        list_of_speakers_amount_last_on_projector: number;
        list_of_speakers_amount_next_on_projector: boolean;
        list_of_speakers_couple_countdown: boolean;
        list_of_speakers_show_amount_of_speakers_on_slide: boolean;
        list_of_speakers_present_users_only: boolean;
        list_of_speakers_show_first_contribution: boolean;

        // Motions
        motions_default_workflow_id: Id;
        motions_default_amendment_workflow_id: Id;
        motions_default_statute_amendment_workflow_id: Id;
        motions_preamble: string;
        motions_default_line_numbering: string;
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
        motions_recommendation_text_mode: string;
        motions_default_sorting: string;
        motions_identifier_type: string;
        motions_identifier_min_digits: number;
        motions_identifier_with_blank: boolean;
        motions_statutes_enabled: boolean;
        motions_amendments_enabled: boolean;
        motions_amendments_in_main_list: boolean;
        motions_amendments_of_amendments: boolean;
        motions_amendments_prefix: string;
        motions_amendments_text_mode: string;
        motions_amendments_multiple_paragraphs: boolean;
        motions_supporters_min_amount: number;
        motions_supporters_enable_autoremove: boolean;
        motions_export_title: string;
        motions_export_preamble: string;
        motions_export_submitter_recommendation: boolean;
        motions_export_follow_recommendation: boolean;

        motion_poll_ballot_paper_selection: string;
        motion_poll_ballot_paper_number: number;
        motion_poll_default_type: string;
        motion_poll_default_100_percent_base: string;
        motion_poll_default_majority_method: string;
        motion_poll_default_group_ids: Id[];

        // Users
        users_sort_by: string;
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
        assignemnts_export_title: string;
        assignments_export_preamble: string;

        assignment_poll_ballot_paper_selection: string;
        assignment_poll_ballot_paper_number: number;
        assignment_poll_add_candidates_to_list_of_speakers: boolean;
        assignment_poll_sort_poll_result_by_votes: boolean;
        assignment_poll_default_type: string;
        assignment_poll_default_method: string;
        assignment_poll_default_100_percent_base: string;
        assignment_poll_default_majority_method: string;
        assignment_poll_default_group_ids: Id[];

        // Other relations
        guest_ids: Id[];
        default_meeting_for_committee_id: Id;
    }

    export interface DeleteAllSpeakersOfAllListsPayload extends Identifiable {}
}
