import { Id, Ids } from '../../definitions/key-types';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { HasProperties } from '../../interfaces/has-properties';
import { AgendaItemCreation, AgendaItemType } from '../agenda/agenda-item';
import { BaseModel } from '../base/base-model';
import { ChangeRecoMode, LineNumberingMode } from '../motions/motions.constants';
import { PollBackendDurationType, PollMethod, PollPercentBase, PollType } from '../poll/poll-constants';
import { ApplauseType } from './applause';
import {
    BallotPaperSelection,
    ExportCsvEncoding,
    MeetingDefaultProjectorIdsKey,
    MeetingMediafileUsageIdKey
} from './meeting.constants';

export class Settings {
    // Old "general_*" configs
    public name!: string;
    public description!: string;
    public location!: string;
    public start_time!: number;
    public end_time!: number;

    public welcome_title!: string;
    public welcome_text!: string;
    public custom_translations!: {
        [original: string]: string;
    };

    public point_of_order_category_ids!: Ids;

    // TODO: Move to meeting. these are not settings anymore, if the meeting-detail-view
    // in the committee-list-view is finished.
    public enable_anonymous!: boolean;
    public language!: boolean;

    // Jitsi/Livestream settings
    public jitsi_domain!: string;
    public jitsi_room_name!: string;
    public jitsi_room_password!: string;

    public conference_show!: boolean;
    public conference_auto_connect!: boolean;
    public conference_los_restriction!: boolean;
    public conference_stream_url!: string;
    public conference_open_microphone!: boolean;
    public conference_open_video!: boolean;
    public conference_auto_connect_next_speakers!: number;
    public conference_stream_poster_url!: string;
    public conference_enable_helpdesk!: boolean;

    // Applause
    public applause_enable!: boolean;
    public applause_type!: ApplauseType;
    public applause_show_level!: boolean;
    public applause_min_amount!: number;
    public applause_max_amount!: number;
    public applause_timeout!: number;
    public applause_particle_image_url!: string;

    // Projector
    public projector_countdown_default_time!: number;
    public projector_countdown_warning_time!: number;

    // Exports
    public export_csv_encoding!: ExportCsvEncoding;
    public export_csv_separator!: string;
    public export_pdf_pagenumber_alignment!: string;
    public export_pdf_fontsize!: number;
    public export_pdf_pagesize!: string;
    public export_pdf_line_height!: number;
    public export_pdf_page_margin_left!: number;
    public export_pdf_page_margin_top!: number;
    public export_pdf_page_margin_right!: number;
    public export_pdf_page_margin_bottom!: number;

    // Agenda
    public agenda_show_subtitles!: boolean;
    public agenda_enable_numbering!: boolean;
    public agenda_number_prefix!: string;
    public agenda_numeral_system!: string;
    public agenda_item_creation!: AgendaItemCreation;
    public agenda_new_items_default_visibility!: AgendaItemType;
    public agenda_show_internal_items_on_projector!: boolean;
    public agenda_show_topic_navigation_on_detail_view!: boolean;

    // List of speakers
    public list_of_speakers_amount_last_on_projector!: number;
    public list_of_speakers_amount_next_on_projector!: boolean;
    public list_of_speakers_couple_countdown!: boolean;
    public list_of_speakers_show_amount_of_speakers_on_slide!: boolean;
    public list_of_speakers_present_users_only!: boolean;
    public list_of_speakers_show_first_contribution!: boolean;
    public list_of_speakers_hide_contribution_count!: boolean;
    public list_of_speakers_enable_point_of_order_categories!: boolean;
    public list_of_speakers_enable_point_of_order_speakers!: boolean;
    public list_of_speakers_initially_closed!: boolean;
    public list_of_speakers_enable_pro_contra_speech!: boolean;
    public list_of_speakers_can_set_contribution_self!: boolean;
    public list_of_speakers_allow_multiple_speakers!: boolean;
    public list_of_speakers_speaker_note_for_everyone!: boolean;
    public list_of_speakers_closing_disables_point_of_order!: boolean;
    public list_of_speakers_can_create_point_of_order_for_others!: boolean;

    public list_of_speakers_default_structure_level_time: number;
    public list_of_speakers_enable_interposed_question: boolean;
    public list_of_speakers_intervention_time: number;

    // Motions
    public motions_default_workflow_id!: Id; // workflow/default_workflow_meeting_id;
    public motions_default_amendment_workflow_id!: Id; // workflow/default_amendment_workflow_meeting_id;
    public motions_preamble!: string;
    public motions_default_line_numbering!: LineNumberingMode;
    public motions_line_length!: number;
    public motions_reason_required!: boolean;
    public motions_enable_text_on_projector!: boolean;
    public motions_enable_reason_on_projector!: boolean;
    public motions_enable_sidebox_on_projector!: boolean;
    public motions_enable_recommendation_on_projector!: boolean;
    public motions_show_referring_motions!: boolean;
    public motions_show_sequential_number!: boolean;
    public motions_recommendations_by!: string;
    public motions_recommendation_text_mode!: ChangeRecoMode;
    public motions_default_sorting!: string;
    public motions_number_type!: string;
    public motions_number_min_digits!: number;
    public motions_number_with_blank!: boolean;
    public motions_amendments_enabled!: boolean;
    public motions_amendments_in_main_list!: boolean;
    public motions_amendments_of_amendments!: boolean;
    public motions_amendments_prefix!: string;
    public motions_amendments_text_mode!: string;
    public motions_amendments_multiple_paragraphs!: boolean;
    public motions_supporters_min_amount!: number;
    public motions_block_slide_columns!: number;
    public motions_enable_editor!: boolean;
    public motions_enable_working_group_speaker!: boolean;
    public motions_export_title!: string;
    public motions_export_preamble!: string;
    public motions_export_submitter_recommendation!: boolean;
    public motions_export_follow_recommendation!: boolean;
    public motions_hide_metadata_background: boolean;
    public motions_create_enable_additional_submitter_text: boolean;

    public motion_poll_ballot_paper_selection!: BallotPaperSelection;
    public motion_poll_ballot_paper_number!: number;
    public motion_poll_default_type!: PollType;
    public motion_poll_default_onehundred_percent_base!: PollPercentBase;
    public motion_poll_default_group_ids!: Id[]; // (group/used_as_motion_poll_default_id)[];
    public motion_poll_default_backend!: PollBackendDurationType;
    public motion_poll_default_method!: PollMethod;

    // Users
    public users_enable_presence_view!: boolean;
    public users_enable_vote_weight!: boolean;
    public users_enable_vote_delegations!: boolean;
    public users_allow_self_set_present!: boolean;
    public users_pdf_welcometitle!: string;
    public users_pdf_welcometext!: string;
    public users_pdf_wlan_ssid!: string;
    public users_pdf_wlan_password!: string;
    public users_pdf_wlan_encryption!: string;
    public users_email_sender!: string;
    public users_email_replyto!: string;
    public users_email_subject!: string;
    public users_email_body!: string;
    public users_forbid_delegator_in_list_of_speakers!: boolean;
    public users_forbid_delegator_as_submitter!: boolean;
    public users_forbid_delegator_as_supporter!: boolean;
    public users_forbid_delegator_to_vote!: boolean;

    // Assignments
    public assignments_export_title!: string;
    public assignments_export_preamble!: string;

    public assignment_poll_ballot_paper_selection!: BallotPaperSelection;
    public assignment_poll_ballot_paper_number!: number;
    public assignment_poll_add_candidates_to_list_of_speakers!: boolean;
    public assignment_poll_enable_max_votes_per_option!: boolean;
    public assignment_poll_sort_poll_result_by_votes!: boolean;
    public assignment_poll_default_type!: PollType;
    public assignment_poll_default_method!: PollMethod;
    public assignment_poll_default_onehundred_percent_base!: PollPercentBase;
    public assignment_poll_default_group_ids!: Id[]; // (group/used_as_assignment_poll_default_id)[];
    public assignment_poll_default_backend!: PollBackendDurationType;

    //topic poll
    public topic_poll_default_group_ids: Id[]; // (group/used_as_poll_default_id)[];

    //default poll
    public poll_ballot_paper_selection: BallotPaperSelection;
    public poll_ballot_paper_number: number;
    public poll_sort_poll_result_by_votes: boolean;
    public poll_default_type: PollType;
    public poll_default_method: PollMethod;
    public poll_default_onehundred_percent_base: PollPercentBase;
    public poll_default_group_ids: Id[]; // (group/used_as_poll_default_id)[];
    public poll_default_backend: PollBackendDurationType;

    //SSO
    public external_id!: string;

    // Structure Level
    public structure_level_ids: Id[]; // (structure_level/meeting_id)

    // lock meeting
    public locked_from_inside: boolean;
}

export class Meeting extends BaseModel<Meeting> {
    public static COLLECTION = `meeting`;
    public static ACCESSIBILITY_FIELD: keyof Meeting = `language`;

    public imported_at!: number;

    public projector_ids!: Id[]; // (projector/meeting_id)[];
    public all_projection_ids!: Id[]; // (projection/meeting_id)[];
    public projector_message_ids!: Id[]; // (projector_message/meeting_id)[];
    public projector_countdown_ids!: Id[]; // (projector_countdown/meeting_id)[];
    public tag_ids!: Id[]; // (tag/meeting_id)[];
    public agenda_item_ids!: Id[]; // (agenda_item/meeting_id)[];
    public list_of_speakers_ids!: Id[]; // (list_of_speakers/meeting_id)[];
    public speaker_ids!: Id[]; // (speaker/meeting_id)[];
    public topic_ids!: Id[]; // (topic/meeting_id)[];
    public group_ids!: Id[]; // (group/meeting_id)[];
    public personal_note_ids!: Id[]; // (personal_note/meeting_id)[];
    public mediafile_ids!: Id[]; // (mediafile/meeting_id)[];
    public meeting_mediafile_ids!: Id[]; // (mediafile/meeting_id)[];
    public motion_ids!: Id[]; // (motion/meeting_id)[];
    public motion_comment_section_ids!: Id[]; // (motion_comment_section/meeting_id)[];
    public motion_comment_ids!: Id[]; // (motion_comment/meeting_id)[];
    public motion_category_ids!: Id[]; // (motion_category/meeting_id)[];
    public motion_block_ids!: Id[]; // (motion_block/meeting_id)[];
    public motion_submitter_ids!: Id[]; // (motion_submitter/meeting_id)[];
    public motion_editor_ids!: Id[]; // (motion_editor/meeting_id)[];
    public motion_working_group_speaker_ids!: Id[]; // (motion_working_group_speaker/meeting_id)[];
    public motion_change_recommendation_ids!: Id[]; // (motion_change_recommendation/meeting_id)[];
    public motion_workflow_ids!: Id[]; // (motion_workflow/meeting_id)[];
    public motion_state_ids!: Id[]; // (motion_state/meeting_id)[];
    public forwarded_motion_ids!: Id[];
    public poll_ids!: Id[]; // (poll/meeting_id)[];
    public option_ids!: Id[]; // (option/meeting_id)[];
    public vote_ids!: Id[]; // (vote/meeting_id)[];
    public assignment_ids!: Id[]; // (assignment/meeting_id)[];
    public assignment_candidate_ids!: Id[]; // (assignment_candidate/meeting_id)[];
    public chat_group_ids!: Id[]; // (chat_group/meeting_id)[];
    public chat_message_ids!: Id[]; // (chat_message/meeting_id)[];
    public poll_candidate_list_ids!: Id[]; // (poll_candidate_list/meeting_id)[];
    public poll_candidate_ids!: Id[]; // (poll_candidate/meeting_id)[];
    public user_ids!: Id[];

    // Other relations
    public present_user_ids!: Id[]; // (user/is_present_in_meeting_ids)[];
    public meeting_user_ids!: Id[]; // Calculated: All ids all users assigned to groups.
    public reference_projector_id!: Id; // projector/used_as_reference_projector_meeting_id;

    public default_group_id!: Id; // group/default_group_for_meeting_id;
    public admin_group_id!: Id; // group/admin_group_for_meeting_id;
    public anonymous_group_id!: Id; // group/anonymous_group_for_meeting_id;

    public list_of_speakers_countdown_id: Id; // projector_countdown/used_as_list_of_speakers_meeting_id;
    public poll_countdown_id: Id; // projector_countdown/used_as_poll_countdown_meeting_id;

    public committee_id!: Id; // committee/meeting_ids;
    public default_meeting_for_committee_id!: Id; // committee/default_meeting_id;

    public organization_tag_ids!: Id[]; // (organization_tag/meeting_ids)[];
    public is_active_in_organization_id!: Id; // (organization/active_meeting_ids)[];
    public is_archived_in_organization_id!: Id; // (organization/archived_meeting_ids)[];
    public template_for_organization_id!: Id; // (organization/template_meeting_ids)[];

    public structure_level_list_of_speakers_ids: Id[]; // (structure_level_list_of_speakers/meeting_id)[]

    public constructor(input?: any) {
        super(Meeting.COLLECTION, input);
    }

    public logo_id(place: string): Id | null {
        return (this[`logo_${place}_id` as keyof Meeting] as Id) || null;
    }

    public font_id(place: string): Id | null {
        return (this[`font_${place}_id` as keyof Meeting] as Id) || null;
    }

    public default_projector_ids(place: string): Id[] | null {
        return (this[`default_projector_${place}_ids` as keyof Meeting] as Id[]) || [];
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Meeting)[] = [
        `id`,
        `external_id`,
        `welcome_title`,
        `welcome_text`,
        `name`,
        `is_active_in_organization_id`,
        `is_archived_in_organization_id`,
        `description`,
        `location`,
        `start_time`,
        `end_time`,
        `locked_from_inside`,
        `imported_at`,
        `language`,
        `jitsi_domain`,
        `jitsi_room_name`,
        `jitsi_room_password`,
        `template_for_organization_id`,
        `enable_anonymous`,
        `custom_translations`,
        `conference_show`,
        `conference_auto_connect`,
        `conference_los_restriction`,
        `conference_stream_url`,
        `conference_stream_poster_url`,
        `conference_open_microphone`,
        `conference_open_video`,
        `conference_auto_connect_next_speakers`,
        `conference_enable_helpdesk`,
        `applause_enable`,
        `applause_type`,
        `applause_show_level`,
        `applause_min_amount`,
        `applause_max_amount`,
        `applause_timeout`,
        `applause_particle_image_url`,
        `projector_countdown_default_time`,
        `projector_countdown_warning_time`,
        `export_csv_encoding`,
        `export_csv_separator`,
        `export_pdf_pagenumber_alignment`,
        `export_pdf_fontsize`,
        `export_pdf_line_height`,
        `export_pdf_page_margin_left`,
        `export_pdf_page_margin_top`,
        `export_pdf_page_margin_right`,
        `export_pdf_page_margin_bottom`,
        `export_pdf_pagesize`,
        `agenda_show_subtitles`,
        `agenda_enable_numbering`,
        `agenda_number_prefix`,
        `agenda_numeral_system`,
        `agenda_item_creation`,
        `agenda_new_items_default_visibility`,
        `agenda_show_internal_items_on_projector`,
        `agenda_show_topic_navigation_on_detail_view`,
        `list_of_speakers_amount_last_on_projector`,
        `list_of_speakers_amount_next_on_projector`,
        `list_of_speakers_couple_countdown`,
        `list_of_speakers_show_amount_of_speakers_on_slide`,
        `list_of_speakers_present_users_only`,
        `list_of_speakers_show_first_contribution`,
        `list_of_speakers_hide_contribution_count`,
        `list_of_speakers_allow_multiple_speakers`,
        `list_of_speakers_enable_point_of_order_speakers`,
        `list_of_speakers_can_create_point_of_order_for_others`,
        `list_of_speakers_enable_point_of_order_categories`,
        `list_of_speakers_closing_disables_point_of_order`,
        `list_of_speakers_enable_pro_contra_speech`,
        `list_of_speakers_can_set_contribution_self`,
        `list_of_speakers_speaker_note_for_everyone`,
        `list_of_speakers_initially_closed`,
        `list_of_speakers_default_structure_level_time`,
        `list_of_speakers_enable_interposed_question`,
        `list_of_speakers_intervention_time`,
        `motions_default_workflow_id`,
        `motions_default_amendment_workflow_id`,
        `motions_preamble`,
        `motions_default_line_numbering`,
        `motions_line_length`,
        `motions_reason_required`,
        `motions_enable_text_on_projector`,
        `motions_enable_reason_on_projector`,
        `motions_enable_sidebox_on_projector`,
        `motions_enable_recommendation_on_projector`,
        `motions_hide_metadata_background`,
        `motions_show_referring_motions`,
        `motions_show_sequential_number`,
        `motions_create_enable_additional_submitter_text`,
        `motions_recommendations_by`,
        `motions_block_slide_columns`,
        `motions_recommendation_text_mode`,
        `motions_default_sorting`,
        `motions_number_type`,
        `motions_number_min_digits`,
        `motions_number_with_blank`,
        `motions_amendments_enabled`,
        `motions_amendments_in_main_list`,
        `motions_amendments_of_amendments`,
        `motions_amendments_prefix`,
        `motions_amendments_text_mode`,
        `motions_amendments_multiple_paragraphs`,
        `motions_supporters_min_amount`,
        `motions_enable_editor`,
        `motions_enable_working_group_speaker`,
        `motions_export_title`,
        `motions_export_preamble`,
        `motions_export_submitter_recommendation`,
        `motions_export_follow_recommendation`,
        `motion_poll_ballot_paper_selection`,
        `motion_poll_ballot_paper_number`,
        `motion_poll_default_type`,
        `motion_poll_default_method`,
        `motion_poll_default_onehundred_percent_base`,
        `motion_poll_default_group_ids`,
        `motion_poll_default_backend`,
        `poll_candidate_list_ids`,
        `poll_candidate_ids`,
        `meeting_user_ids`,
        `users_enable_presence_view`,
        `users_enable_vote_weight`,
        `users_allow_self_set_present`,
        `users_pdf_welcometitle`,
        `users_pdf_welcometext`,
        `users_pdf_wlan_ssid`,
        `users_pdf_wlan_password`,
        `users_pdf_wlan_encryption`,
        `users_email_sender`,
        `users_email_replyto`,
        `users_email_subject`,
        `users_email_body`,
        `users_enable_vote_delegations`,
        `users_forbid_delegator_in_list_of_speakers`,
        `users_forbid_delegator_as_submitter`,
        `users_forbid_delegator_as_supporter`,
        `users_forbid_delegator_to_vote`,
        `assignments_export_title`,
        `assignments_export_preamble`,
        `assignment_poll_ballot_paper_selection`,
        `assignment_poll_ballot_paper_number`,
        `assignment_poll_add_candidates_to_list_of_speakers`,
        `assignment_poll_enable_max_votes_per_option`,
        `assignment_poll_sort_poll_result_by_votes`,
        `assignment_poll_default_type`,
        `assignment_poll_default_method`,
        `assignment_poll_default_onehundred_percent_base`,
        `assignment_poll_default_group_ids`,
        `assignment_poll_default_backend`,
        `poll_ballot_paper_selection`,
        `poll_ballot_paper_number`,
        `poll_sort_poll_result_by_votes`,
        `poll_default_type`,
        `poll_default_method`,
        `poll_default_onehundred_percent_base`,
        `poll_default_group_ids`,
        `poll_default_backend`,
        `topic_poll_default_group_ids`,
        `projector_ids`,
        `all_projection_ids`,
        `projector_message_ids`,
        `projector_countdown_ids`,
        `tag_ids`,
        `agenda_item_ids`,
        `list_of_speakers_ids`,
        `structure_level_list_of_speakers_ids`,
        `point_of_order_category_ids`,
        `speaker_ids`,
        `topic_ids`,
        `group_ids`,
        `meeting_mediafile_ids`,
        `mediafile_ids`,
        `motion_ids`,
        `forwarded_motion_ids`,
        `motion_comment_section_ids`,
        `motion_category_ids`,
        `motion_block_ids`,
        `motion_workflow_ids`,
        `motion_comment_ids`,
        `motion_submitter_ids`,
        `motion_editor_ids`,
        `motion_working_group_speaker_ids`,
        `motion_change_recommendation_ids`,
        `motion_state_ids`,
        `poll_ids`,
        `option_ids`,
        `vote_ids`,
        `assignment_ids`,
        `assignment_candidate_ids`,
        `personal_note_ids`,
        `chat_group_ids`,
        `chat_message_ids`,
        `structure_level_ids`,
        `logo_projector_main_id`,
        `logo_projector_header_id`,
        `logo_web_header_id`,
        `logo_pdf_header_l_id`,
        `logo_pdf_header_r_id`,
        `logo_pdf_footer_l_id`,
        `logo_pdf_footer_r_id`,
        `logo_pdf_ballot_paper_id`,
        `font_regular_id`,
        `font_italic_id`,
        `font_bold_id`,
        `font_bold_italic_id`,
        `font_monospace_id`,
        `font_chyron_speaker_name_id`,
        `font_projector_h1_id`,
        `font_projector_h2_id`,
        `committee_id`,
        `default_meeting_for_committee_id`,
        `organization_tag_ids`,
        `present_user_ids`,
        `user_ids`,
        `reference_projector_id`,
        `list_of_speakers_countdown_id`,
        `poll_countdown_id`,
        `projection_ids`,
        `default_projector_agenda_item_list_ids`,
        `default_projector_topic_ids`,
        `default_projector_list_of_speakers_ids`,
        `default_projector_current_list_of_speakers_ids`,
        `default_projector_motion_ids`,
        `default_projector_amendment_ids`,
        `default_projector_motion_block_ids`,
        `default_projector_assignment_ids`,
        `default_projector_mediafile_ids`,
        `default_projector_message_ids`,
        `default_projector_countdown_ids`,
        `default_projector_assignment_poll_ids`,
        `default_projector_motion_poll_ids`,
        `default_projector_poll_ids`,
        `default_group_id`,
        `admin_group_id`,
        `anonymous_group_id`
    ];
}
export interface Meeting
    extends Settings,
        HasProjectionIds,
        HasProperties<MeetingMediafileUsageIdKey, number>,
        HasProperties<MeetingDefaultProjectorIdsKey, number[]> {}
