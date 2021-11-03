import { StructuredRelation } from 'app/core/definitions/relations';
import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { HasMeeting, ViewMeeting } from 'app/management/models/view-meeting';
import { HasAttachmentIds } from 'app/shared/models/base/has-attachment-ids';
import { Mediafile } from 'app/shared/models/mediafiles/mediafile';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { HasListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { Searchable } from 'app/site/base/searchable';
import { ViewGroup } from 'app/site/users/models/view-group';

export const IMAGE_MIMETYPES = [`image/png`, `image/jpeg`, `image/gif`];
export const FONT_MIMETYPES = [`font/ttf`, `font/woff`, `font/woff2`];
export const PDF_MIMETYPES = [`application/pdf`];
export const VIDEO_MIMETYPES = [
    `video/quicktime`,
    `video/mp4`,
    `video/webm`,
    `video/ogg`,
    `video/x-flv`,
    `application/x-mpegURL`,
    `video/MP2T`,
    `video/3gpp`,
    `video/x-msvideo`,
    `video/x-ms-wmv`,
    `video/x-matroska`
];

export interface HasAttachment extends HasAttachmentIds {
    attachments: ViewMediafile[];
}

export class ViewMediafile extends BaseProjectableViewModel<Mediafile> {
    public static COLLECTION = Mediafile.COLLECTION;
    protected _collection = Mediafile.COLLECTION;

    public get mediafile(): Mediafile {
        return this._model;
    }

    public get pages(): number | null {
        return this.mediafile.pdf_information?.pages || null;
    }

    public get timestamp(): string {
        return this.mediafile.create_timestamp ? this.mediafile.create_timestamp : null;
    }

    public formatForSearch(): SearchRepresentation {
        const type = this.is_directory ? `directory` : this.mimetype;
        const properties = [
            { key: `Title`, value: this.getTitle() },
            { key: `Type`, value: type },
            { key: `Timestamp`, value: this.timestamp },
            { key: `Size`, value: this.filesize ? this.filesize : `0` }
        ];
        return {
            properties,
            searchValue: properties.map(property => property.value),
            type
        };
    }

    public getDetailStateURL(): string {
        return this.url;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.mediafile;
    }

    public getDirectoryChain(): ViewMediafile[] {
        const parentChain = this.parent ? this.parent.getDirectoryChain() : [];
        parentChain.push(this);
        return parentChain;
    }

    public isProjectable(): boolean {
        return this.isImage() || this.isPdf();
    }

    /**
     * Determine if the file is an image
     *
     * @returns true or false
     */
    public isImage(): boolean {
        return IMAGE_MIMETYPES.includes(this.mimetype);
    }

    /**
     * Determine if the file is a font
     *
     * @returns true or false
     */
    public isFont(): boolean {
        return FONT_MIMETYPES.includes(this.mimetype);
    }

    /**
     * Determine if the file is a pdf
     *
     * @returns true or false
     */
    public isPdf(): boolean {
        return PDF_MIMETYPES.includes(this.mimetype);
    }

    /**
     * Determine if the file is a video
     *
     * @returns true or false
     */
    public isVideo(): boolean {
        return VIDEO_MIMETYPES.includes(this.mimetype);
    }

    public getIcon(): string {
        if (this.is_directory) {
            return `folder`;
        } else if (this.isPdf()) {
            return `picture_as_pdf`;
        } else if (this.isImage()) {
            return `insert_photo`;
        } else if (this.isFont()) {
            return `text_fields`;
        } else if (this.isVideo()) {
            return `movie`;
        } else {
            return `insert_drive_file`;
        }
    }
}
interface IMediafileRelations {
    access_groups: ViewGroup[];
    inherited_access_groups: ViewGroup[];
    parent?: ViewMediafile;
    children: ViewMediafile[];
    attachments: (BaseViewModel & HasAttachment)[];
    used_as_logo_in_meeting: StructuredRelation<string, ViewMeeting | null>;
    used_as_font_in_meeting: StructuredRelation<string, ViewMeeting | null>;
}
export interface ViewMediafile extends Mediafile, IMediafileRelations, Searchable, HasMeeting, HasListOfSpeakers {}
