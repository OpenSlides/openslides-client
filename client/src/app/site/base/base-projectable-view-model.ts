import { ProjectorTitle } from 'app/core/core-services/projector.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { BaseModel } from 'app/shared/models/base/base-model';
import { BaseViewModel } from './base-view-model';
import { Projectable, ProjectorElementBuildDeskriptor } from './projectable';

/**
 * Base view class for projectable models.
 */
export abstract class BaseProjectableViewModel<M extends BaseModel = any> extends BaseViewModel<M> {
    public abstract getSlide(meetingSettingsService?: MeetingSettingsService): ProjectorElementBuildDeskriptor;

    /**
     * @returns the projector title used for managing projector elements.
     */
    public getProjectorTitle(): ProjectorTitle {
        return { title: this.getTitle() };
    }
}
export interface BaseProjectableViewModel<M extends BaseModel = any> extends Projectable {}
