import { Fqid, Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { HasProperties } from '../../interfaces/has-properties';
import { BaseModel } from '../base/base-model';
import {
    FONT_PLACES,
    FontPlace,
    LOGO_PLACES,
    LogoPlace,
    MediafileMeetingUsageIdKey,
    MediafileUsageType
} from '../mediafiles/mediafile.constants';

/**
 * Representation of MeetingMediaFile
 * @ignore
 */
export class MeetingMediafile extends BaseModel<MeetingMediafile> {
    public static COLLECTION = `meeting_mediafile`;

    public mediafile_id: Id;
    public is_public: boolean;
    public inherited_access_group_ids!: Id[]; // (group/meeting_mediafile_inherited_access_group_ids)[];  // Note: calculated
    public access_group_ids!: Id[]; // (group/meeting_mediafile_access_group_ids)[];
    public attachment_ids!: Fqid[]; // (*/attachment_meeting_mediafile_ids)[];

    public constructor(input?: any) {
        super(MeetingMediafile.COLLECTION, input);
    }

    /**
     * Check if the image is used at the given place. If place is empty, checks
     * if the image is used in any place and returns the first meeting id found.
     *
     * @param place The places the image can be used
     * @returns the meeting id or `null` if the image is not used.
     */
    public used_as_logo_in_meeting_id(place?: LogoPlace): Id | null {
        return this.used_in_meeting(`logo`, place);
    }

    /**
     * Check if the font is used at the given place. If place is empty, checks
     * if the font is used in any place and returns the first meeting id found.
     *
     * @param place The text parts the font can be used
     * @returns the meeting id or `null` if the font is not used.
     */
    public used_as_font_in_meeting_id(place?: FontPlace): Id | null {
        return this.used_in_meeting(`font`, place);
    }

    private used_in_meeting(type: MediafileUsageType, place?: LogoPlace | FontPlace): Id | null {
        if (!place) {
            const list = this.getPlaces();
            for (let i = 0; i < list?.length; i++) {
                const meetingId = this.getSpecificUsedInMeetingId(type, list[i]);
                if (meetingId) {
                    return meetingId;
                }
            }
            return null;
        }

        if (this.getPlaces().indexOf(place) === -1) {
            return null;
        }

        return this.getSpecificUsedInMeetingId(type, place) || null;
    }

    public getFontPlaces(): FontPlace[] {
        return FONT_PLACES.filter(place => !!this.getSpecificUsedInMeetingId(`font`, place));
    }

    public getLogoPlaces(): LogoPlace[] {
        return LOGO_PLACES.filter(place => !!this.getSpecificUsedInMeetingId(`logo`, place));
    }

    public getPlaces(): (LogoPlace | FontPlace)[] {
        return [...this.getFontPlaces(), ...this.getLogoPlaces()];
    }

    private getSpecificUsedInMeetingId(type: MediafileUsageType, place: LogoPlace | FontPlace): Id {
        const path = `used_as_${type}_${place}_in_meeting_id` as keyof MeetingMediafile;
        return this[path] as Id;
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
    extends HasProjectionIds, HasListOfSpeakersId, HasMeetingId, HasProperties<MediafileMeetingUsageIdKey, number> {}
