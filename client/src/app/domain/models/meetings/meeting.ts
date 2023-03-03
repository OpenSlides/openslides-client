import { Id } from '../../definitions/key-types';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { AgendaItemCreation, AgendaItemType } from '../agenda/agenda-item';
import { BaseModel } from '../base/base-model';
import { HasIdProperties } from '../mediafiles/mediafile';
import { FONT_PLACES, FontPlace, LOGO_PLACES,LogoPlace } from '../mediafiles/mediafile.constants';
import { ChangeRecoMode, LineNumberingMode } from '../motions/motions.constants';
import { PollBackendDurationType, PollMethod, PollPercentBase, PollType } from '../poll/poll-constants';
import { ApplauseType } from './applause';

export type ExportCsvEncoding = 'utf-8' | 'iso-8859-15';

/**
 * Server side ballot choice definitions.
 * Server-defined methods to determine the number of ballots to print
 * Options are:
 * - NUMBER_OF_DELEGATES Amount of users belonging to the predefined 'delegates' group (group id 2)
 * - NUMBER_OF_ALL_PARTICIPANTS The amount of all registered users
 * - CUSTOM_NUMBER a given number of ballots
 */
export type BallotPaperSelection = 'NUMBER_OF_DELEGATES' | 'NUMBER_OF_ALL_PARTICIPANTS' | 'CUSTOM_NUMBER';

export type MeetingMediafileUsageIdKey = `logo_${LogoPlace}_id` | `font_${FontPlace}_id`;

export const MEETING_MEDIAFILE_USAGE_ID_KEYS = [
    ...LOGO_PLACES.map(place => `logo_${place}_id` as MeetingMediafileUsageIdKey),
    ...FONT_PLACES.map(place => `font_${place}_id` as MeetingMediafileUsageIdKey)
];

interface HasMediafileUsageIds extends HasIdProperties<MeetingMediafileUsageIdKey> {}

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

    // TODO: Move to meeting. these are not settings anymore, if the meeting-detail-view
    // in the committee-list-view is finished.
    public is_template!: boolean; // Unique within a committee
    public enable_anonymous!: boolean;

    // Jitsi/Livestream settings
    public jitsi_domain!: string;
    public jitsi_room_name!: string;
    public jitsi_room_password!: string;

    // Chat
    public enable_chat!: boolean;

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

    // List of speakers
    public list_of_speakers_amount_last_on_projector!: number;
    public list_of_speakers_amount_next_on_projector!: boolean;
    public list_of_speakers_couple_countdown!: boolean;
    public list_of_speakers_show_amount_of_speakers_on_slide!: boolean;
    public list_of_speakers_present_users_only!: boolean;
    public list_of_speakers_show_first_contribution!: boolean;
    public list_of_speakers_enable_point_of_order_speakers!: boolean;
    public list_of_speakers_initially_closed!: boolean;
    public list_of_speakers_enable_pro_contra_speech!: boolean;
    public list_of_speakers_can_set_contribution_self!: boolean;
    public list_of_speakers_speaker_note_for_everyone!: boolean;

    // Motions
    public motions_default_workflow_id!: Id; // workflow/default_workflow_meeting_id;
    public motions_default_amendment_workflow_id!: Id; // workflow/default_amendment_workflow_meeting_id;
    public motions_default_statute_amendment_workflow_id!: Id; // workflow/default_statute_amendment_workflow_meeting_id;
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
    public motions_statute_recommendations_by!: string;
    public motions_recommendation_text_mode!: ChangeRecoMode;
    public motions_default_sorting!: string;
    public motions_number_type!: string;
    public motions_number_min_digits!: number;
    public motions_number_with_blank!: boolean;
    public motions_statutes_enabled!: boolean;
    public motions_amendments_enabled!: boolean;
    public motions_amendments_in_main_list!: boolean;
    public motions_amendments_of_amendments!: boolean;
    public motions_amendments_prefix!: string;
    public motions_amendments_text_mode!: string;
    public motions_amendments_multiple_paragraphs!: boolean;
    public motions_supporters_min_amount!: number;
    public motions_block_slide_columns!: number;
    public motions_export_title!: string;
    public motions_export_preamble!: string;
    public motions_export_submitter_recommendation!: boolean;
    public motions_export_follow_recommendation!: boolean;

    public motion_poll_ballot_paper_selection!: BallotPaperSelection;
    public motion_poll_ballot_paper_number!: number;
    public motion_poll_default_type!: PollType;
    public motion_poll_default_100_percent_base!: PollPercentBase;
    public motion_poll_default_group_ids!: Id[]; // (group/used_as_motion_poll_default_id)[];
    public motion_poll_default_backend!: PollBackendDurationType;

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
    public assignment_poll_default_100_percent_base!: PollPercentBase;
    public assignment_poll_default_group_ids!: Id[]; // (group/used_as_assignment_poll_default_id)[];
    public assignment_poll_default_backend!: PollBackendDurationType;

    //topic poll
    topic_poll_ballot_paper_selection: BallotPaperSelection;
    topic_poll_ballot_paper_number: number;
    topic_poll_add_candidates_to_list_of_speakers: boolean;
    topic_poll_enable_max_votes_per_option: boolean;
    topic_poll_sort_poll_result_by_votes: boolean;
    topic_poll_default_type: PollType;
    topic_poll_default_method: PollMethod;
    topic_poll_default_100_percent_base: PollPercentBase;
    topic_poll_default_group_ids: Id[]; // (group/used_as_poll_default_id)[];
    topic_poll_default_backend: PollBackendDurationType;

    //default poll
    poll_ballot_paper_selection: BallotPaperSelection;
    poll_ballot_paper_number: number;
    poll_add_candidates_to_list_of_speakers: boolean;
    poll_enable_max_votes_per_option: boolean;
    poll_sort_poll_result_by_votes: boolean;
    poll_default_type: PollType;
    poll_default_method: PollMethod;
    poll_default_100_percent_base: PollPercentBase;
    poll_default_group_ids: Id[]; // (group/used_as_poll_default_id)[];
    poll_default_backend: PollBackendDurationType;
}

export class Meeting extends BaseModel<Meeting> {
    public static COLLECTION = `meeting`;

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
    public motion_ids!: Id[]; // (motion/meeting_id)[];
    public motion_comment_section_ids!: Id[]; // (motion_comment_section/meeting_id)[];
    public motion_comment_ids!: Id[]; // (motion_comment/meeting_id)[];
    public motion_category_ids!: Id[]; // (motion_category/meeting_id)[];
    public motion_block_ids!: Id[]; // (motion_block/meeting_id)[];
    public motion_submitter_ids!: Id[]; // (motion_submitter/meeting_id)[];
    public motion_change_recommendation_ids!: Id[]; // (motion_change_recommendation/meeting_id)[];
    public motion_workflow_ids!: Id[]; // (motion_workflow/meeting_id)[];
    public motion_state_ids!: Id[]; // (motion_state/meeting_id)[];
    public motion_statute_paragraph_ids!: Id[]; // (motion_statute_paragraph/meeting_id)[];
    public forwarded_motion_ids!: Id[];
    public poll_ids!: Id[]; // (poll/meeting_id)[];
    public option_ids!: Id[]; // (option/meeting_id)[];
    public vote_ids!: Id[]; // (vote/meeting_id)[];
    public assignment_ids!: Id[]; // (assignment/meeting_id)[];
    public assignment_candidate_ids!: Id[]; // (assignment_candidate/meeting_id)[];
    public chat_group_ids!: Id[]; // (chat_group/meeting_id)[];
    public chat_message_ids!: Id[]; // (chat_message/meeting_id)[];

    // Other relations
    public present_user_ids!: Id[]; // (user/is_present_in_meeting_ids)[];
    public meeting_user_ids!: Id[]; // Calculated: All ids all users assigned to groups.
    public reference_projector_id!: Id; // projector/used_as_reference_projector_meeting_id;
    public default_projector_$_ids!: string[]; // projector/used_as_default_$_in_meeting_id;

    public default_group_id!: Id; // group/default_group_for_meeting_id;
    public admin_group_id!: Id; // group/admin_group_for_meeting_id;

    public list_of_speakers_countdown_id: Id; // projector_countdown/used_as_list_of_speakers_meeting_id;
    public poll_countdown_id: Id; // projector_countdown/used_as_poll_countdown_meeting_id;

    public committee_id!: Id; // committee/meeting_ids;
    public default_meeting_for_committee_id!: Id; // committee/default_meeting_id;

    public organization_tag_ids!: Id[]; // (organization_tag/meeting_ids)[];
    public is_active_in_organization_id!: Id; // (organization/active_meeting_ids)[];
    public is_archived_organization_id!: Id; // (organization/archived_meeting_ids)[];
    public template_for_organization_id!: Id; // (organization/template_meeting_ids)[];

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
        return (this[`default_projector_$${place}_ids` as keyof Meeting] as Id[]) || [];
    }
}
export interface Meeting extends Settings, HasProjectionIds, HasMediafileUsageIds {}
