import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { HasProperties } from 'src/app/domain/interfaces/has-properties';
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
import { HasAttachment } from './has-attachment';
import { ViewMediafile } from './view-mediafile';

export class ViewMeetingMediafile extends BaseProjectableViewModel<MeetingMediafile> {
    public static COLLECTION = MeetingMediafile.COLLECTION;
    protected _collection = MeetingMediafile.COLLECTION;

    public get meeting_mediafile(): MeetingMediafile {
        return this._model;
    }

    public get title(): string {
        return this.mediafile.title;
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
        if (this.mediafile.isPubishedOrganizationWide) {
            return true;
        } else if (this.mediafile?.owner_id === `organization/1`) {
            return !this.getEnsuredActiveMeetingId();
        } else if (this.getProjectedContentObjects().indexOf(`mediafile/${this.id}`) !== -1) {
            return true;
        } else if (this.mediafile === null) {
            return true;
        } else {
            return this.getEnsuredActiveMeetingId() === this.meeting_id;
        }
    }

    public getProjectiondefault(): ProjectiondefaultValue {
        return PROJECTIONDEFAULT.mediafile;
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
    extends MeetingMediafile,
        ViewModelRelations<IMeetingMediafileRelations>,
        /*  Searchable, */ HasMeeting,
        HasListOfSpeakers,
        HasProperties<ViewMediafileMeetingUsageKey, ViewMeeting> {}
