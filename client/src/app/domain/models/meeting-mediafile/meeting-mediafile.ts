import { Fqid, Id } from '../../definitions/key-types';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { HasProperties } from '../../interfaces/has-properties';
import { BaseModel } from '../base/base-model';
import { MediafileMeetingUsageIdKey } from '../mediafiles/mediafile.constants';

/**
 * Representation of MeetingMediaFile
 * @ignore
 */
export class MeetingMediafile extends BaseModel<MeetingMediafile> {
    public static COLLECTION = `meeting_mediafile`;

    public mediafile_id: Id;
    public meeting_id: string;
    public is_public: boolean;
    public inherited_access_group_ids!: Id[]; // (group/meeting_mediafile_inherited_access_group_ids)[];  // Note: calculated
    public access_group_ids!: Id[]; // (group/meeting_mediafile_access_group_ids)[];
    public attachment_ids!: Fqid[]; // (*/attachment_ids)[];

    public constructor(input?: any) {
        super(MeetingMediafile.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MeetingMediafile)[] = [
        `id`,
        `mediafile_id`,
        `meeting_id`,
        `is_public`,
        `inherited_access_group_ids`,
        `access_group_ids`,
        `list_of_speakers_id`,
        `projection_ids`,
        `attachment_ids`,
        `used_as_logo_projector_main_in_meeting_id`,
        `used_as_logo_projector_header_in_meeting_id`,
        `used_as_logo_web_header_in_meeting_id`,
        `used_as_logo_pdf_header_l_in_meeting_id`,
        `used_as_logo_pdf_header_r_in_meeting_id`,
        `used_as_logo_pdf_footer_l_in_meeting_id`,
        `used_as_logo_pdf_footer_r_in_meeting_id`,
        `used_as_logo_pdf_ballot_paper_in_meeting_id`,
        `used_as_font_regular_in_meeting_id`,
        `used_as_font_italic_in_meeting_id`,
        `used_as_font_bold_in_meeting_id`,
        `used_as_font_bold_italic_in_meeting_id`,
        `used_as_font_monospace_in_meeting_id`,
        `used_as_font_chyron_speaker_name_in_meeting_id`,
        `used_as_font_projector_h1_in_meeting_id`,
        `used_as_font_projector_h2_in_meeting_id`
    ];
}
export interface MeetingMediafile
    extends HasProjectionIds,
        HasListOfSpeakersId,
        HasProperties<MediafileMeetingUsageIdKey, number> {}
