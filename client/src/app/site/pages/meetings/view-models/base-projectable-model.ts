import { BaseModel } from '../../../../domain/models/base/base-model';
import { BaseViewModel } from '../../../base/base-view-model';
import { Projectiondefault } from '../../../../domain/models/projector/projection-default';
import { ProjectorTitle } from '../../../../domain/interfaces/has-projector-title';
import { Projection } from '../../../../domain/models/projector/projection';
import { Projectable } from './projectable';
import { MeetingSettingsService } from '../services/meeting-settings.service';
import { ProjectionBuildDescriptor } from './projection-build-descriptor';
/**
 * Base view class for projectable models.
 */
export abstract class BaseProjectableViewModel<M extends BaseModel = any> extends BaseViewModel<M> {
    public getProjectionBuildDescriptor(
        meetingSettingsService?: MeetingSettingsService
    ): ProjectionBuildDescriptor | null {
        return {
            content_object_id: this.fqid,
            projectionDefault: this.getProjectiondefault(),
            getDialogTitle: this.getTitle
        };
    }

    public abstract getProjectiondefault(): Projectiondefault | null;

    /**
     * @returns the projector title used for managing projector elements.
     */
    public getProjectorTitle(projection: Projection): ProjectorTitle {
        return { title: this.getTitle() };
    }
}
export interface BaseProjectableViewModel<M extends BaseModel = any> extends Projectable {}
