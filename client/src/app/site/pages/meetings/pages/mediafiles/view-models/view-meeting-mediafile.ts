import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { HasProperties } from 'src/app/domain/interfaces/has-properties';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { ViewMediafileMeetingUsageKey } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { Meeting } from 'src/app/domain/models/meetings/meeting';
import { PROJECTIONDEFAULT, ProjectiondefaultValue } from 'src/app/domain/models/projector/projection-default';
import { collectionIdFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

import { MeetingMediafile } from '../../../../../../domain/models/meeting-mediafile/meeting-mediafile';
import { BaseViewModel, ViewModelRelations } from '../../../../../base/base-view-model';
import { BaseProjectableViewModel } from '../../../view-models/base-projectable-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeeting } from '../../../view-models/view-meeting';
import { HasListOfSpeakers } from '../../agenda/modules/list-of-speakers';
import { ViewGroup } from '../../participants/modules/groups/view-models/view-group';
import { VIDEO_MIMETYPES } from '../definitions/index';
import { HasAttachment } from './has-attachment';
import { ViewMediafile } from './view-mediafile';

export class ViewMeetingMediafile extends BaseProjectableViewModel<MeetingMediafile> {
    public static COLLECTION = MeetingMediafile.COLLECTION;
    protected _collection = MeetingMediafile.COLLECTION;

    public get meeting_mediafile(): MeetingMediafile {
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
    public getProjectedContentObjects!: () => Fqid[];

    public override canAccess(): boolean {
        if (this.is_published_to_meetings) {
            return true;
        } else if (this.mediafile.owner_id === `organization/1`) {
            return !this.getEnsuredActiveMeetingId();
        } else if (this.getProjectedContentObjects().indexOf(`mediafile/${this.id}`) !== -1) {
            return true;
        } else {
            return this.getEnsuredActiveMeetingId() === this.meeting_id;
        }
    }

    public override getDetailStateUrl(): string {
        return this.url;
    }

    public getProjectiondefault(): ProjectiondefaultValue {
        return PROJECTIONDEFAULT.mediafile;
    }

    public getDirectoryChain(): ViewMeetingMediafile[] {
        const parentChain = this.parent ? this.parent.getDirectoryChain() : [];
        parentChain.push(this);
        return parentChain;
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
        } else if (this.isVideo()) {
            return `movie`;
        } else if (this.is_public) {
            return `public`;
        } else {
            return `insert_drive_file`;
        }
    }
}
interface IMeetingMediafileRelations {
    access_groups: ViewGroup[];
    inherited_access_groups: ViewGroup[];
    parent?: ViewMeetingMediafile;
    children: ViewMeetingMediafile[];
    attachments: (BaseViewModel & HasAttachment)[];
    organization?: ViewOrganization;
    mediafile?: ViewMediafile;
}
export interface ViewMeetingMediafile
    extends Mediafile,
        ViewModelRelations<IMeetingMediafileRelations>,
        /*  Searchable, */ HasMeeting,
        HasListOfSpeakers,
        HasProperties<ViewMediafileMeetingUsageKey, ViewMeeting> {}
