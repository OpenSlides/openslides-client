import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { HasProjectionIds } from 'app/shared/models/base/has-projectable-ids';
import { Projection } from 'app/shared/models/projector/projection';
import { Displayable } from 'app/site/base/displayable';
import { ProjectionBuildDescriptor } from './projection-build-descriptor';
import { ViewProjection } from '../projector/models/view-projection';

export interface ProjectorTitle {
    title: string;
    subtitle?: string;
}

export interface HasProjectorTitle {
    getProjectorTitle: (projection: Projection) => ProjectorTitle;
}

export function isProjectable(obj: any): obj is Projectable {
    return !!obj && obj.getProjectionBuildDescriptor !== undefined && obj.getProjectorTitle !== undefined;
}

/**
 * Interface for every model, that should be projectable.
 */
export interface Projectable extends Displayable, HasProjectionIds, HasProjectorTitle {
    projections: ViewProjection[];

    getProjectionBuildDescriptor(meetingSettingsService?: MeetingSettingsService): ProjectionBuildDescriptor;
}
