import { Fqid, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasListOfSpeakersId } from '../base/has-list-of-speakers-id';
import { HasProjectableIds } from '../base/has-projectable-ids';

interface PdfInformation {
    pages?: number;
    encrypted?: boolean;
}

/**
 * Representation of MediaFile. Has the nested property "File"
 * @ignore
 */
export class Mediafile extends BaseModel<Mediafile> {
    public static COLLECTION = 'mediafile';
    public static MEDIA_URL_PREFIX = '/media/';

    public id: Id;
    public title: string;
    public is_directory: boolean;
    public filesize?: string;
    public filename: string;
    public mimetype?: string;
    public pdf_information: PdfInformation;
    public create_timestamp: string;
    public has_inherited_access_groups: boolean;

    public access_group_ids: Id[]; // (group/mediafile_access_group_ids)[];
    public inherited_access_group_ids: Id[]; // (group/mediafile_inherited_access_group_ids)[];  // Note: calculated
    public parent_id: Id; // mediafile/child_ids;
    public child_ids: Id[]; // (mediafile/parent_id)[];
    public attachment_ids: Fqid[]; // (*/attachment_ids)[];
    public meeting_id: Id; // meeting/mediafile_ids;
    public used_as_logo_$_in_meeting_id: string[]; // meeting/logo_$<place>_id;
    public used_as_font_$_in_meeting_id: string[]; // meeting/font_$<place>_id;

    public constructor(input?: any) {
        super(Mediafile.COLLECTION, input);
    }

    public used_as_logo_in_meeting_id(place: string): Id | null {
        return this[`used_as_logo_${place}_in_meeting_id`] || null;
    }

    public used_as_font_in_meeting_id(place: string): Id | null {
        return this[`used_as_font_${place}_in_meeting_id`] || null;
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
export interface Mediafile extends HasProjectableIds, HasListOfSpeakersId {}
