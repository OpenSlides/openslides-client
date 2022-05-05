import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';

export interface ProjectionDialogReturnType {
    action: 'project' | 'addToPreview';
    resultDescriptor: ProjectionBuildDescriptor;
    projectors: ViewProjector[];
    options: object | null;
}
