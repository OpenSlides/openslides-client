import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { MultiProjectionBuildDescriptor, ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';

export interface ProjectionDialogReturnType {
    action: `project` | `bulkAddToPreview` | `addToPreview` | `hide`;
    resultDescriptor: ProjectionBuildDescriptor | MultiProjectionBuildDescriptor;
    projectors: ViewProjector[];
    options: object | null;
    keepActiveProjections?: boolean;
}
