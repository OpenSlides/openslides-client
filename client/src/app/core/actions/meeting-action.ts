import { Identifiable } from 'app/shared/models/base/identifiable';

import { Id, UnsafeHtml } from '../definitions/key-types';
import { ImportMeeting } from '../repositories/management/meeting-repository.service';

export namespace MeetingAction {
    export const CREATE = `meeting.create`;
    export const UPDATE = `meeting.update`;
    export const DELETE = `meeting.delete`;
    export const CREATE_FROM_TEMPLATE = `meeting.create_from_template`;
    export const DELETE_ALL_SPEAKERS_OF_ALL_LISTS = `meeting.delete_all_speakers_of_all_lists`;
    export const SET_FONT = `meeting.set_font`;
    export const SET_LOGO = `meeting.set_logo`;
    export const UNSET_FONT = `meeting.unset_font`;
    export const UNSET_LOGO = `meeting.unset_logo`;
    export const IMPORT = `meeting.import`;
    export const CLONE = `meeting.clone`;
    export const ARCHIVE = `meeting.archive`;
    export const UNARCHIVE = `meeting.unarchive`;

    interface MetaPayload {
        description?: string;
        location?: string;
        start_time?: number;
        end_time?: number;
        organization_tag_ids?: Id[];
        url_name?: string;

        // Optional, modified the template_for_committee_id relation
        set_as_template: boolean;
    }

    export interface CreatePayload extends MetaPayload {
        // Required
        committee_id: Id;
        name: string;

        // Optional
        user_ids?: Id[];
        admin_ids?: Id[];
    }
    export interface CreateFromTemplatePayload {
        committee_id: Id;
    }
    export interface UpdatePayload extends OptionalUpdatePayload, Identifiable, MetaPayload {}
    export interface OptionalUpdatePayload extends MetaPayload {
        welcome_title?: string;
        welcome_text?: UnsafeHtml;

        name?: string;

        jitsi_domain?: string;
        jitsi_room_name?: string;
        jitsi_room_password?: string;

        enable_anonymous?: boolean;

        conference_show?: boolean;
        conference_auto_connect?: boolean;
        conference_los_restriction?: boolean;
        conference_stream_url?: string;
        conference_stream_poster_url?: string;
        conference_open_microphone?: boolean;
        conference_open_video?: boolean;
        conference_auto_connect_next_speakers?: number;

        projector_default_countdown_time?: number;
        projector_countdown_warning_time?: number;

        export_csv_encoding?: string;
        export_csv_separator?: string;
        export_pdf_pagenumber_alignment?: string;
        export_pdf_fontsize?: number;
        export_pdf_line_height?: number;
        export_pdf_pagesize?: string;
        export_pdf_page_margin_left?: number;
        export_pdf_page_margin_top?: number;
        export_pdf_page_margin_right?: number;
        export_pdf_page_margin_bottom?: number;

        agenda_show_subtitles?: boolean;
        agenda_enable_numbering?: boolean;
        agenda_number_prefix?: string;
        agenda_numeral_system?: string;
        agenda_item_creation?: string;
        agenda_new_items_default_visibility?: string;
        agenda_show_internal_items_on_projector?: boolean;

        list_of_speakers_amount_last_on_projector?: number;
        list_of_speakers_amount_next_on_projector?: number;
        list_of_speakers_couple_countdown?: boolean;
        list_of_speakers_show_amount_of_speakers_on_slide?: boolean;
        list_of_speakers_present_users_only?: boolean;
        list_of_speakers_show_first_contribution?: boolean;
        list_of_speakers_enable_point_of_order_speakers?: boolean;
        list_of_speakers_initially_closed?: boolean;

        motions_default_workflow_id?: Id;
        motions_default_amendment_workflow_id?: Id;
        motions_default_statute_amendment_workflow_id?: Id;
        motions_preamble?: string;
        motions_default_line_numbering?: string;
        motions_line_length?: number;
        motions_reason_required?: boolean;
        motions_enable_text_on_projector?: boolean;
        motions_enable_reason_on_projector?: boolean;
        motions_enable_sidebox_on_projector?: boolean;
        motions_enable_recommendation_on_projector?: boolean;
        motions_show_referring_motions?: boolean;
        motions_show_sequential_number?: boolean;
        motions_recommendations_by?: string;
        motions_statute_recommendations_by?: string;
        motions_recommendation_text_mode?: string;
        motions_default_sorting?: string;
        motions_number_type?: string;
        motions_number_min_digits?: number;
        motions_number_with_blank?: boolean;
        motions_statutes_enabled?: boolean;
        motions_amendments_enabled?: boolean;
        motions_amendments_in_main_list?: boolean;
        motions_amendments_of_amendments?: boolean;
        motions_amendments_prefix?: string;
        motions_amendments_text_mode?: string;
        motions_amendments_multiple_paragraphs?: boolean;
        motions_supporters_min_amount?: number;
        motions_export_title?: string;
        motions_export_preamble?: string;
        motions_export_submitter_recommendation?: boolean;
        motions_export_follow_recommendation?: boolean;

        motion_poll_ballot_paper_selection?: string;
        motion_poll_ballot_paper_number?: number;
        motion_poll_default_type?: string;
        motion_poll_default_100_percent_base?: string;
        motion_poll_default_group_ids?: Id[];

        users_sort_by?: string;
        users_enable_presence_view?: boolean;
        users_enable_vote_weight?: boolean;
        users_allow_self_set_present?: boolean;
        users_pdf_welcometitle?: string;
        users_pdf_welcometext?: string;
        users_pdf_url?: string;
        users_pdf_wlan_ssid?: string;
        users_pdf_wlan_password?: string;
        users_pdf_wlan_encryption?: string;
        users_email_sender?: string;
        users_email_replyto?: string;
        users_email_subject?: string;
        users_email_body?: string;

        assignments_export_title?: string;
        assignments_export_preamble?: string;

        assignment_poll_ballot_paper_selection?: string;
        assignment_poll_ballot_paper_number?: number;
        assignment_poll_add_candidates_to_list_of_speakers?: boolean;
        assignment_poll_enable_max_votes_per_option?: boolean;
        assignment_poll_sort_poll_result_by_votes?: boolean;
        assignment_poll_default_type?: string;
        assignment_poll_default_method?: string;
        assignment_poll_default_100_percent_base?: string;
        assignment_poll_default_group_ids?: Id[];

        poll_ballot_paper_selection?: string;
        poll_ballot_paper_number?: number;
        poll_sort_poll_result_by_votes?: boolean;
        poll_default_type?: string;
        poll_default_method?: string;
        poll_default_100_percent_base?: string;
        poll_default_group_ids?: Id[];

        present_user_ids?: Id[];
        reference_projector_id?: Id;
        // default_projector_$_id: Id; // TODO
    }

    export interface DeletePayload extends Identifiable {}

    export interface DeleteAllSpeakersOfAllListsPayload extends Identifiable {}

    export interface SetLogoPayload extends Identifiable {
        place: string;
        mediafile_id: Id;
    }
    export interface SetFontPayload extends Identifiable {
        place: string;
        mediafile_id: Id;
    }
    export interface UnsetLogoPayload extends Identifiable {
        place: string;
    }
    export interface UnsetFontPayload extends Identifiable {
        place: string;
    }

    export interface ImportPayload {
        committee_id: Id;
        meeting: ImportMeeting;
    }

    export interface ClonePayload {
        meeting_id: Id;
        /**
         * A `committee_id` can be given to clone a meeting into another committee than its source committee
         */
        committee_id?: Id;
    }
    export interface ArchivePayload extends Identifiable {}
    export interface UnarchivePayload extends Identifiable {}
}
