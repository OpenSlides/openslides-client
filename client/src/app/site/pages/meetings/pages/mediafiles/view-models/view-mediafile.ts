import { Id } from 'src/app/domain/definitions/key-types';
import { HasProperties } from 'src/app/domain/interfaces/has-properties';
import { ViewMediafileMeetingUsageKey } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { Meeting } from 'src/app/domain/models/meetings/meeting';
import { PROJECTIONDEFAULT, ProjectiondefaultValue } from 'src/app/domain/models/projector/projection-default';
import { collectionIdFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

import { Mediafile } from '../../../../../../domain/models/mediafiles/mediafile';
import { BaseViewModel, ViewModelRelations } from '../../../../../base/base-view-model';
import { BaseProjectableViewModel } from '../../../view-models/base-projectable-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeeting } from '../../../view-models/view-meeting';
import { HasListOfSpeakers } from '../../agenda/modules/list-of-speakers';
import { ViewGroup } from '../../participants/modules/groups/view-models/view-group';
import { FONT_MIMETYPES, IMAGE_MIMETYPES, PDF_MIMETYPES } from '../definitions';
import { VIDEO_MIMETYPES } from '../definitions/index';
import { HasAttachmentMeetingMediafiles } from './has-attachment';
import { ViewMeetingMediafile } from './view-meeting-mediafile';

export class ViewMediafile extends BaseProjectableViewModel<Mediafile> {
    public static COLLECTION = Mediafile.COLLECTION;
    protected _collection = Mediafile.COLLECTION;

    public get mediafile(): Mediafile {
        return this._model;
    }

    public get inherited_access_group_ids(): Id[] {
        const meetingMediafile = this.getMeetingMediafile();
        if (!meetingMediafile && this.getEnsuredActiveMeeting()?.admin_group_id) {
            return [this.getEnsuredActiveMeeting().admin_group_id];
        }

        return meetingMediafile?.inherited_access_group_ids;
    }

    public get inherited_access_groups(): ViewGroup[] {
        const meetingMediafile = this.getMeetingMediafile();
        if (!meetingMediafile && this.getEnsuredActiveMeeting()?.admin_group) {
            return [this.getEnsuredActiveMeeting().admin_group];
        }

        return meetingMediafile?.inherited_access_groups;
    }

    public get has_inherited_access_groups(): boolean {
        return !!this.inherited_access_group_ids?.length;
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
        const [collection, id] = collectionIdFromFqid(this.owner_id);
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
    public getEnsuredActiveMeeting!: () => ViewMeeting;
    public getMeetingMediafile!: (meetingId?: Id) => ViewMeetingMediafile;

    public override canAccess(): boolean {
        if (this.owner_id === `organization/1`) {
            if (
                this.published_to_meetings_in_organization_id === 1 ||
                this.meeting_mediafiles.some(mm => mm.meeting_id === this.getEnsuredActiveMeetingId())
            ) {
                return true;
            }

            return !this.getEnsuredActiveMeetingId();
        } else if (this.meeting_mediafiles.some(mm => !!mm.projection_ids?.length)) {
            return true;
        }

        return this.getEnsuredActiveMeetingId() === this.meeting_id;
    }

    public canMoveFilesTo(files: ViewMediafile[]): boolean {
        if (!this.is_directory) {
            return false;
        }

        // Check if moving folder into itself
        if (files.some(file => this.id === file.id)) {
            return false;
        }

        // Check if moving meeting mediafile into published folder
        if (files.some(file => file.owner_id.startsWith(`meeting`)) && this.isPublishedOrganizationWide) {
            return false;
        }

        return true;
    }

    public override getDetailStateUrl(): string {
        return this.url;
    }

    public getProjectiondefault(): ProjectiondefaultValue {
        return PROJECTIONDEFAULT.mediafile;
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
    attachments: (BaseViewModel & HasAttachmentMeetingMediafiles)[];
    organization?: ViewOrganization;
    meeting_mediafiles: ViewMeetingMediafile[];
    published_to_meetings_in_organization: ViewOrganization;
}
export interface ViewMediafile
    extends Mediafile,
        ViewModelRelations<IMediafileRelations>,
        /*  Searchable, */ HasMeeting,
        HasListOfSpeakers,
        HasProperties<ViewMediafileMeetingUsageKey, ViewMeeting> {}
