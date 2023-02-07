import { Fqid, Id } from '../../definitions/key-types';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasOwnerId } from '../../interfaces/has-owner-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { BaseModel } from '../base/base-model';

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
    public used_as_logo_$_in_meeting_id!: string[]; // meeting/logo_$<place>_id;
    public used_as_font_$_in_meeting_id!: string[]; // meeting/font_$<place>_id;

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
    public used_as_logo_in_meeting_id(place?: string): Id | null {
        return this.used_in_meeting(`logo`, place);
    }

    /**
     * Check if the font is used at the given place. If place is empty, checks
     * if the font is used in any place and returns the first meeting id found.
     *
     * @param place The text parts the font can be used
     * @returns the meeting id or `null` if the font is not used.
     */
    public used_as_font_in_meeting_id(place?: string): Id | null {
        return this.used_in_meeting(`font`, place);
    }

    private used_in_meeting(type: string, place?: string): Id | null {
        if (!place) {
            const list = this[`used_as_${type}_$_in_meeting_id`];
            for (let i = 0; i < list?.length; i++) {
                const path = `used_as_${type}_$${list[i]}_in_meeting_id` as keyof Mediafile;
                if (path in this) {
                    return this[path] as Id;
                }
            }
            return null;
        }

        if (this[`used_as_${type}_$_in_meeting_id`].indexOf(place) === -1) {
            return null;
        }

        const path = `used_as_${type}_$${place}_in_meeting_id` as keyof Mediafile;
        return (this[path] as Id) || null;
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
export interface Mediafile extends HasOwnerId, HasProjectionIds, HasListOfSpeakersId {}
