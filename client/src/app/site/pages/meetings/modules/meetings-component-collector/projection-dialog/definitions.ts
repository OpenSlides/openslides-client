import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';

export interface ProjectionDialogReturnType {
    action: 'project' | 'addToPreview' | 'toggle';
    resultDescriptor: ProjectionBuildDescriptor;
    projectors: ViewProjector[];
    options: object | null;
}
