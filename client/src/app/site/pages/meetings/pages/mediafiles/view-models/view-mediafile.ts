import { Id } from 'src/app/domain/definitions/key-types';
import { FONT_PLACES, FontPlace, LOGO_PLACES,LogoPlace } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { Meeting } from 'src/app/domain/models/meetings/meeting';
import { collectionIdFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

import { Mediafile } from '../../../../../../domain/models/mediafiles/mediafile';
import { Projectiondefault } from '../../../../../../domain/models/projector/projection-default';
import { BaseViewModel } from '../../../../../base/base-view-model';
import { BaseProjectableViewModel } from '../../../view-models/base-projectable-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeeting } from '../../../view-models/view-meeting';
import { HasListOfSpeakers } from '../../agenda/modules/list-of-speakers';
import { ViewGroup } from '../../participants/modules/groups/view-models/view-group';
import { FONT_MIMETYPES, IMAGE_MIMETYPES, PDF_MIMETYPES } from '../definitions';
import { VIDEO_MIMETYPES } from '../definitions/index';
import { HasAttachment } from './has-attachment';

export type ViewMediafileUsageKey = `used_as_logo_${LogoPlace}_in_meeting` | `used_as_font_${FontPlace}_in_meeting`;

export type HasProperties<KeyType extends string, ValueType> = { [property in KeyType]: ValueType };

export const VIEW_MEETING_MEDIAFILE_USAGE_ID_KEYS = [
    ...LOGO_PLACES.map(place => `used_as_logo_${place}_in_meeting` as ViewMediafileUsageKey),
    ...FONT_PLACES.map(place => `used_as_font_${place}_in_meeting` as ViewMediafileUsageKey)
];

interface HasMeetingUsage extends HasProperties<ViewMediafileUsageKey, ViewMeeting> {}

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
            throw Error(`Mediafile's owner_id is not a meeting`);
        }
        return id;
    }

    /**
     * A function which will return the id of the currently active meeting, if one is chosen.
     *
     * @returns The id of the currently active meeting
     */
    public getEnsuredActiveMeetingId!: () => Id;

    public override canAccess(): boolean {
        if (this.owner_id === `organization/1`) {
            return !this.getEnsuredActiveMeetingId();
        } else {
            return this.getEnsuredActiveMeetingId() === this.meeting_id;
        }
    }

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
    organization?: ViewOrganization;
}
export interface ViewMediafile
    extends Mediafile,
        IMediafileRelations,
        /*  Searchable, */ HasMeeting,
        HasListOfSpeakers,
        HasMeetingUsage {}
