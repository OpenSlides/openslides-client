import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    ProjectionDialogComponent,
    ProjectionDialogReturnType
} from 'app/shared/components/projection-dialog/projection-dialog.component';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';

import { ProjectorRepositoryService } from '../repositories/projector/projector-repository.service';

/**
 * Manages the projection dialog. Projects the result of the user's choice.
 */
@Injectable({
    providedIn: `root`
})
export class ProjectionDialogService {
    /**
     * Constructor.
     *
     * @param dialog
     * @param projectorService
     */
    public constructor(private dialog: MatDialog, private projectorRepo: ProjectorRepositoryService) {}

    /**
     * Opens the projection dialog for the given projectable. After the user's choice,
     * the projectors will be updated.
     */
    public async openProjectDialogFor(descriptor: ProjectionBuildDescriptor): Promise<void> {
        const dialogRef = this.dialog.open<
            ProjectionDialogComponent,
            ProjectionBuildDescriptor,
            ProjectionDialogReturnType
        >(ProjectionDialogComponent, {
            maxHeight: `90vh`,
            autoFocus: false,
            data: descriptor
        });
        const response = await dialogRef.afterClosed().toPromise();
        if (response) {
            const [action, resultDescriptor, projectors, options]: ProjectionDialogReturnType = response;
            if (action === `project`) {
                await this.projectorRepo.project(resultDescriptor, projectors, options);
            } else if (action === `addToPreview`) {
                await this.projectorRepo.addToPreview(resultDescriptor, projectors, options);
            } else {
                throw new Error(`Unknown projector action ` + action);
            }
        }
    }
}
