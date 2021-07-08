import { Fqid } from 'app/core/definitions/key-types';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { SlideOptions } from './slide-options';

export function isProjectionBuildDescriptor(obj: any): obj is ProjectionBuildDescriptor {
    const descriptor = <ProjectionBuildDescriptor>obj;
    return !!descriptor && descriptor.content_object_id !== undefined && descriptor.getDialogTitle !== undefined;
}

export interface ProjectionBuildDescriptor {
    content_object_id: Fqid;
    stable?: boolean;
    type?: string;
    slideOptions?: SlideOptions;
    projectionDefault?: Projectiondefault;

    /**
     * The title to show in the projection dialog
     */
    getDialogTitle(): string;
}
