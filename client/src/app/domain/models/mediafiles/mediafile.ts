import { Fqid, Id } from '../../definitions/key-types';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasOwnerId } from '../../interfaces/has-owner-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { HasProperties } from '../../interfaces/has-properties';
import { BaseModel } from '../base/base-model';
import { FONT_PLACES, FontPlace, LOGO_PLACES, LogoPlace, MediafileMeetingUsageIdKey } from './mediafile.constants';

interface PdfInformation {
    pages?: number;
    encrypted?: boolean;
}

/**
 * Representation of MediaFile. Has the nested property "File"
 * @ignore
 */
export class Mediafile extends BaseModel<Mediafile> {
    public static COLLECTION = `mediafile`;
    public static MEDIA_URL_PREFIX = `/media/`;

    public title!: string;
    public is_directory!: boolean;
    public filesize!: string;
    public filename!: string;
    public mimetype!: string;
    public pdf_information!: PdfInformation;
    public create_timestamp!: string;
    public has_inherited_access_groups!: boolean;
    public token: string;

    public access_group_ids!: Id[]; // (group/mediafile_access_group_ids)[];
    public inherited_access_group_ids!: Id[]; // (group/mediafile_inherited_access_group_ids)[];  // Note: calculated
    public parent_id!: Id; // mediafile/child_ids;
    public child_ids!: Id[]; // (mediafile/parent_id)[];
    public attachment_ids!: Fqid[]; // (*/attachment_ids)[];

    public constructor(input?: any) {
        super(Mediafile.COLLECTION, input);
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

    private used_in_meeting(type: string, place?: LogoPlace | FontPlace): Id | null {
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

    private getSpecificUsedInMeetingId(type: string, place: LogoPlace | FontPlace): Id {
        const path = `used_as_${type}_${place}_in_meeting_id` as keyof Mediafile;
        return this[path] as Id;
    }

    /**
     * Determine the downloadURL
     *
     * @returns the download URL for the specific file as string
     */
    public get url(): string {
        return this.is_directory ? `/mediafiles/${this.id}` : `/system/media/get/${this.id}`;
    }
}
export interface Mediafile
    extends HasOwnerId,
        HasProjectionIds,
        HasListOfSpeakersId,
        HasProperties<MediafileMeetingUsageIdKey, number> {}
