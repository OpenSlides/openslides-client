import { Displayable } from '../../../../domain/interfaces/displayable';
import { HasProjectionIds } from '../../../../domain/interfaces/has-projectable-ids';
import { HasProjectorTitle } from '../../../../domain/interfaces/has-projector-title';
import { MeetingSettingsService } from '../services/meeting-settings.service';
import { ProjectionBuildDescriptor } from './projection-build-descriptor';
import { ViewProjection } from '../pages/projectors';

export function isProjectable(obj: any): obj is Projectable {
    return !!obj && obj.getProjectionBuildDescriptor !== undefined && obj.getProjectorTitle !== undefined;
}

/**
 * Interface for every model, that should be projectable.
 */
export interface Projectable extends Displayable, HasProjectionIds, HasProjectorTitle {
    projections: ViewProjection[];

    getProjectionBuildDescriptor(meetingSettingsService?: MeetingSettingsService): ProjectionBuildDescriptor | null;
}
