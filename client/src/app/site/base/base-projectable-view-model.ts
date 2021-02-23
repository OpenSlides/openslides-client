import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { BaseModel } from 'app/shared/models/base/base-model';
import { Projection } from 'app/shared/models/projector/projection';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { BaseViewModel } from './base-view-model';
import { Projectable, ProjectorTitle } from './projectable';
import { ProjectionBuildDescriptor } from './projection-build-descriptor';

/**
 * Base view class for projectable models.
 */
export abstract class BaseProjectableViewModel<M extends BaseModel = any> extends BaseViewModel<M> {
    public getProjectionBuildDescriptor(meetingSettingsService?: MeetingSettingsService): ProjectionBuildDescriptor {
        return {
            content_object_id: this.fqid,
            projectionDefault: this.getProjectiondefault(),
            getDialogTitle: this.getTitle
        };
    }

    public abstract getProjectiondefault(): Projectiondefault;

    /**
     * @returns the projector title used for managing projector elements.
     */
    public getProjectorTitle(projection: Projection): ProjectorTitle {
        return { title: this.getTitle() };
    }
}
export interface BaseProjectableViewModel<M extends BaseModel = any> extends Projectable {}
