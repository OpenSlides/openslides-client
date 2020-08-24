import { ProjectorTitle } from 'app/core/core-services/projector.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { HasProjectableIds } from 'app/shared/models/base/has-projectable-ids';
import { Displayable } from 'app/site/base/displayable';
import { SlideOptions } from './slide-options';
import { ViewProjection } from '../projector/models/view-projection';
import { ViewProjector } from '../projector/models/view-projector';

export function isProjectorElementBuildDeskriptor(obj: any): obj is ProjectorElementBuildDeskriptor {
    const deskriptor = <ProjectorElementBuildDeskriptor>obj;
    return (
        !!deskriptor &&
        deskriptor.slideOptions !== undefined &&
        deskriptor.getBasicProjectorElement !== undefined &&
        deskriptor.getDialogTitle !== undefined
    );
}

export interface ProjectorElementBuildDeskriptor {
    slideOptions: SlideOptions;
    projectionDefaultName?: string;
    // TODO
    getBasicProjectorElement(options: any /*ProjectorElementOptions*/): any /*IdentifiableProjectorElement*/;

    /**
     * The title to show in the projection dialog
     */
    getDialogTitle(): string;
}

export function isProjectable(obj: any): obj is Projectable {
    return !!obj && obj.getSlide !== undefined && obj.getProjectorTitle !== undefined;
}

/**
 * Interface for every model, that should be projectable.
 */
export interface Projectable extends Displayable, HasProjectableIds {
    projections: ViewProjection[];
    current_projectors: ViewProjector[];

    getProjectorTitle: () => ProjectorTitle;

    getSlide(meetingSettingsService?: MeetingSettingsService): ProjectorElementBuildDeskriptor;
}
