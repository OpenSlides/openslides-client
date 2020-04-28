import { ProjectorTitle } from 'app/core/core-services/projector.service';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { Displayable } from 'app/site/base/displayable';
import { SlideOptions } from './slide-options';

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
export interface Projectable extends Displayable {
    getProjectorTitle: () => ProjectorTitle;

    getSlide(configSerice?: OrganisationSettingsService): ProjectorElementBuildDeskriptor;
}
