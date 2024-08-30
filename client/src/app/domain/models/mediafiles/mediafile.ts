import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';

import { Id } from '../../definitions/key-types';
import { HasOwnerId } from '../../interfaces/has-owner-id';
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
    public published_to_meetings_in_organization_id!: number;
    public meeting_mediafile_ids!: Id[];
    public filesize!: string;
    public filename!: string;
    public mimetype!: string;
    public pdf_information!: PdfInformation;
    public create_timestamp!: string;
    public token: string;

    public parent_id!: Id; // mediafile/child_ids;
    public child_ids!: Id[]; // (mediafile/parent_id)[];

    public constructor(input?: any) {
        super(Mediafile.COLLECTION, input);
    }

    public get isPubishedOrganizationWide(): boolean {
        return this.published_to_meetings_in_organization_id === ORGANIZATION_ID;
    }

    /**
     * Determine the downloadURL
     *
     * @returns the download URL for the specific file as string
     */
    public get url(): string {
        return this.is_directory ? `/mediafiles/${this.id}` : `/system/media/get/${this.id}`;
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Mediafile)[] = [
        `id`,
        `title`,
        `is_directory`,
        `filesize`,
        `filename`,
        `mimetype`,
        `pdf_information`,
        `create_timestamp`,
        `token`,
        `published_to_meetings_in_organization_id`,
        `parent_id`,
        `child_ids`,
        `owner_id`,
        `meeting_mediafile_ids`
    ];
}
export interface Mediafile extends HasOwnerId {}
