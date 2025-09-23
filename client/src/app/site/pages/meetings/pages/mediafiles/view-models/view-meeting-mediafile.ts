import { Id } from 'src/app/domain/definitions/key-types';
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
import { HasAttachmentMeetingMediafiles } from './has-attachment';
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

    public getIcon(): string {
        return this.mediafile?.getIcon() ?? `insert_drive_file`;
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

    public override canAccess(): boolean {
        return this.getEnsuredActiveMeetingId() === this.meeting_id || !this.getEnsuredActiveMeetingId();
    }

    public getProjectiondefault(): ProjectiondefaultValue {
        return PROJECTIONDEFAULT.mediafile;
    }

    public override getDetailStateUrl(): string {
        return this.url;
    }
}
interface IMeetingMediafileRelations {
    access_groups: ViewGroup[];
    inherited_access_groups: ViewGroup[];
    attachments: (BaseViewModel & HasAttachmentMeetingMediafiles)[];
    mediafile?: ViewMediafile;
}
export interface ViewMeetingMediafile
    extends MeetingMediafile,
        ViewModelRelations<IMeetingMediafileRelations>,
        /*  Searchable, */ HasMeeting,
        HasListOfSpeakers,
        HasProperties<ViewMediafileMeetingUsageKey, ViewMeeting> {}
