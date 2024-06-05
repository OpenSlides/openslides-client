import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';

import {
    ProjectionDialogComponent,
    ProjectionDialogConfig
} from '../components/projection-dialog/projection-dialog.component';
import { ProjectionDialogReturnType } from '../definitions';
import { ProjectionDialogModule } from '../projection-dialog.module';

@Injectable({ providedIn: ProjectionDialogModule })
export class ProjectionDialogService {
    public constructor(private dialog: MatDialog, private projectorRepo: ProjectorControllerService) {}

    /**
     * Opens the projection dialog for the given projectable. After the user's choice,
     * the projectors will be updated.
     */
    public async openProjectDialogFor(descriptor: ProjectionBuildDescriptor | ProjectionDialogConfig): Promise<void> {
        const module = await import(`../projection-dialog.module`).then(m => m.ProjectionDialogModule);
        const dialogRef = this.dialog.open<
            ProjectionDialogComponent,
            ProjectionBuildDescriptor | ProjectionDialogConfig,
            ProjectionDialogReturnType
        >(module.getComponent(), {
            maxHeight: `90vh`,
            autoFocus: false,
            data: descriptor,
            restoreFocus: false
        });
        const response = await firstValueFrom(dialogRef.afterClosed());
        console.log(response);
        if (response) {
            const { action, resultDescriptor, projectors, options, keepActiveProjections }: ProjectionDialogReturnType =
                response;
            if (action === `project`) {
                await this.projectorRepo.project(resultDescriptor, projectors, options, keepActiveProjections);
            } else if (action === `addToPreview`) {
                await this.projectorRepo.addToPreview(resultDescriptor, projectors, options);
            } else if (action === `hide`) {
                if (this.projectorRepo.isProjectedOn(resultDescriptor, projectors[0])) {
                    await this.projectorRepo.toggle(resultDescriptor, projectors, options);
                }
            } else {
                throw new Error(`Unknown projector action ` + action);
            }
        }
    }
}
