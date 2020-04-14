import { Id } from 'app/core/definitions/key-types';
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
    public path: string;
    public inherited_access_group_ids: boolean | number[];

    public access_group_ids: Id[]; // (group/mediafile_access_group_ids)[];
    public parent_id: Id; // mediafile/child_ids;
    public child_ids: Id[]; // (mediafile/parent_id)[];
    public attachment_ids: Id[]; // (*/attachment_ids)[];
    public meeting_id: Id; // meeting/mediafile_ids;
    public used_as_logo_$_in_meeting: string[]; // meeting/logo_$<token>;
    public used_as_font_$_in_meeting: string[]; // meeting/font_$<token>;

    public get has_inherited_access_groups(): boolean {
        return typeof this.inherited_access_group_ids !== 'boolean';
    }

    public constructor(input?: any) {
        super(Mediafile.COLLECTION, input);
    }

    public used_ad_logo_in_meeting(token: string): Id | null {
        return this[`used_as_logo_${token}_in_meeting`] || null;
    }

    public used_ad_font_in_meeting(token: string): Id | null {
        return this[`used_as_font_${token}_in_meeting`] || null;
    }

    /**
     * Determine the downloadURL
     *
     * @returns the download URL for the specific file as string
     */
    public get url(): string {
        return `${Mediafile.MEDIA_URL_PREFIX}${this.path}`;
    }
}
export interface Mediafile extends HasProjectableIds, HasListOfSpeakersId {}
