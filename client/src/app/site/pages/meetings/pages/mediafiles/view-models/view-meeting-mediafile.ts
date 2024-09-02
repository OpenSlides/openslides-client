import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { HasProperties } from 'src/app/domain/interfaces/has-properties';
import { ViewMediafileMeetingUsageKey } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { PROJECTIONDEFAULT, ProjectiondefaultValue } from 'src/app/domain/models/projector/projection-default';

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
     * Determine the downloadURL
     *
     * @returns the download URL for the specific file as string
     */
    public get url(): string {
        return this.mediafile?.is_directory
            ? `/mediafiles/${this.mediafile_id}`
            : `/system/media/get/${this.mediafile_id}`;
    }

    /**
     * A function which will return the id of the currently active meeting, if one is chosen.
     *
     * @returns The id of the currently active meeting
     */
    public getEnsuredActiveMeetingId!: () => Id;
    public getProjectedContentObjects!: () => Fqid[];

    public override canAccess(): boolean {
        if (this.mediafile?.isPubishedOrganizationWide) {
            return true;
        } else if (this.mediafile?.owner_id === `organization/1`) {
            return !this.getEnsuredActiveMeetingId();
        } else if (this.getProjectedContentObjects().indexOf(`mediafile/${this.id}`) !== -1) {
            return true;
        } else if (this.mediafile === null) {
            return true;
        }

        return this.getEnsuredActiveMeetingId() === this.meeting_id;
    }

    public getProjectiondefault(): ProjectiondefaultValue {
        return PROJECTIONDEFAULT.mediafile;
    }
}
interface IMeetingMediafileRelations {
    access_groups: ViewGroup[];
    inherited_access_groups: ViewGroup[];
    attachments: (BaseViewModel & HasAttachment)[];
    mediafile?: ViewMediafile;
}
export interface ViewMeetingMediafile
    extends MeetingMediafile,
        ViewModelRelations<IMeetingMediafileRelations>,
        /*  Searchable, */ HasMeeting,
        HasListOfSpeakers,
        HasProperties<ViewMediafileMeetingUsageKey, ViewMeeting> {}
