import { Fqid } from '../../../../domain/definitions/key-types';
import { ProjectiondefaultValue } from '../../../../domain/models/projector/projection-default';
import { SlideOptions } from './slide-options';

export function isProjectionBuildDescriptor(obj: any): obj is ProjectionBuildDescriptor {
    const descriptor = obj as ProjectionBuildDescriptor;
    return !!descriptor && descriptor.content_object_id !== undefined && descriptor.getDialogTitle !== undefined;
}

export function isMultiProjectionBuildDescriptor(obj: any): obj is MultiProjectionBuildDescriptor {
    const descriptor = obj as MultiProjectionBuildDescriptor;
    return !!descriptor && descriptor.content_object_ids !== undefined && descriptor.getDialogTitle !== undefined;
}

export interface ProjectionBuildDescriptor {
    content_object_id: Fqid;
    stable?: boolean;
    stableToggle?: string;
    type?: string;
    slideOptions?: SlideOptions;
    projectionDefault: ProjectiondefaultValue | null;

    /**
     * The title to show in the projection dialog
     */
    getDialogTitle(): string;
}

export interface MultiProjectionBuildDescriptor {
    content_object_ids: Fqid[];
    projectionDefault: ProjectiondefaultValue | null;

    /**
     * The title to show in the projection dialog
     */
    getDialogTitle(): string;
}
