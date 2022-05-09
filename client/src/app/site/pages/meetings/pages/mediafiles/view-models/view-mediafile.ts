import { HasAttachment } from './has-attachment';
import { BaseViewModel } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeeting } from '../../../view-models/view-meeting';
import { Mediafile } from '../../../../../../domain/models/mediafiles/mediafile';
import { FONT_MIMETYPES, IMAGE_MIMETYPES, PDF_MIMETYPES } from '../definitions';
import { BaseProjectableViewModel } from '../../../view-models/base-projectable-model';
import { Projectiondefault } from '../../../../../../domain/models/projector/projection-default';
import { VIDEO_MIMETYPES } from '../definitions/index';
import { ViewGroup } from '../../participants/modules/groups/view-models/view-group';
import { HasListOfSpeakers } from '../../agenda/modules/list-of-speakers';
import { StructuredRelation } from '../../../../../../infrastructure/definitions/relations';
import { Id } from 'src/app/domain/definitions/key-types';
import { Meeting } from 'src/app/domain/models/meetings/meeting';
import { collectionIdFromFqid } from 'src/app/infrastructure/utils/transform-functions';

export class ViewMediafile extends BaseProjectableViewModel<Mediafile> {
    public static COLLECTION = Mediafile.COLLECTION;
    protected _collection = Mediafile.COLLECTION;

    public get mediafile(): Mediafile {
        return this._model;
    }

    public get pages(): number | null {
        return this.mediafile.pdf_information?.pages || null;
    }

    public get timestamp(): string | null {
        return this.mediafile.create_timestamp ? this.mediafile.create_timestamp : null;
    }

    /**
     * Only use this if you are sure that you have a meeting mediafile
     */
    public get meeting_id(): Id {
        const [collection, id] = collectionIdFromFqid(this.mediafile.owner_id);
        if (collection != Meeting.COLLECTION) {
            throw Error("Mediafile's owner_id is not a meeting");
        }
        return id;
    }

    // public formatForSearch(): SearchRepresentation {
    //     const type = this.is_directory ? `directory` : this.mimetype;
    //     const properties = [
    //         { key: `Title`, value: this.getTitle() },
    //         { key: `Type`, value: type },
    //         { key: `Timestamp`, value: this.timestamp },
    //         { key: `Size`, value: this.filesize ? this.filesize : `0` }
    //     ];
    //     return {
    //         properties,
    //         searchValue: properties.map(property => property.value),
    //         type
    //     };
    // }

    public override getDetailStateUrl(): string {
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
export interface ViewMediafile
    extends Mediafile,
        IMediafileRelations,
        /*  Searchable, */ HasMeeting,
        HasListOfSpeakers {}
