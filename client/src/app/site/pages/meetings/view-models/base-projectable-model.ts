import { ProjectorTitle } from '../../../../domain/interfaces/has-projector-title';
import { BaseModel } from '../../../../domain/models/base/base-model';
import { Projection } from '../../../../domain/models/projector/projection';
import { ProjectiondefaultValue } from '../../../../domain/models/projector/projection-default';
import { BaseViewModel } from '../../../base/base-view-model';
import { MeetingSettingsService } from '../services/meeting-settings.service';
import { Projectable } from './projectable';
import { ProjectionBuildDescriptor } from './projection-build-descriptor';
/**
 * Base view class for projectable models.
 */
export abstract class BaseProjectableViewModel<M extends BaseModel = any> extends BaseViewModel<M> {
    public getProjectionBuildDescriptor(
        _meetingSettingsService?: MeetingSettingsService
    ): ProjectionBuildDescriptor | null {
        return {
            content_object_id: this.fqid,
            projectionDefault: this.getProjectiondefault(),
            getDialogTitle: this.getTitle
        };
    }

    public abstract getProjectiondefault(): ProjectiondefaultValue | null;

    /**
     * @returns the projector title used for managing projector elements.
     */
    public getProjectorTitle(_projection: Projection): ProjectorTitle {
        return { title: this.getTitle() };
    }
}
export interface BaseProjectableViewModel extends Projectable {}
