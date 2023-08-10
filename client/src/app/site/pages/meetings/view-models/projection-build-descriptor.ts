import { Fqid } from '../../../../domain/definitions/key-types';
import { ProjectiondefaultValue } from '../../../../domain/models/projector/projection-default';
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
    projectionDefault: ProjectiondefaultValue | null;

    /**
     * The title to show in the projection dialog
     */
    getDialogTitle(): string;
}
