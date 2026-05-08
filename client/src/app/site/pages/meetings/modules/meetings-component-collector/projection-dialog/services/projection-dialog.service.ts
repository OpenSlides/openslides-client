import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import {
    isMultiProjectionBuildDescriptor,
    isProjectionBuildDescriptor,
    MultiProjectionBuildDescriptor,
    ProjectionBuildDescriptor
} from 'src/app/site/pages/meetings/view-models';

import {
    ProjectionDialogComponent,
    ProjectionDialogConfig
} from '../components/projection-dialog/projection-dialog.component';
import { ProjectionDialogReturnType } from '../definitions';

@Injectable({ providedIn: 'root' })
export class ProjectionDialogService {
    public constructor(
        private dialog: MatDialog,
        private projectorRepo: ProjectorControllerService
    ) {}

    /**
     * Opens the projection dialog for the given projectable. After the user's choice,
     * the projectors will be updated.
     */
    public async openProjectDialogFor(descriptor: ProjectionBuildDescriptor | ProjectionDialogConfig): Promise<void> {
        const module = await import(`../projection-dialog.module`).then(m => m.ProjectionDialogModule);
        const dialogRef = this.dialog.open<
            ProjectionDialogComponent,
            ProjectionBuildDescriptor | MultiProjectionBuildDescriptor | ProjectionDialogConfig,
            ProjectionDialogReturnType
        >(module.getComponent(), {
            maxHeight: `90vh`,
            autoFocus: false,
            data: descriptor,
            restoreFocus: false
        });
        const response = await firstValueFrom(dialogRef.afterClosed());
        if (response) {
            const { action, resultDescriptor, projectors, options, keepActiveProjections }: ProjectionDialogReturnType =
                response;
            if (action === `project` && isProjectionBuildDescriptor(resultDescriptor)) {
                await this.projectorRepo.project(resultDescriptor, projectors, options, keepActiveProjections);
            } else if (action === `addToPreview` && isProjectionBuildDescriptor(resultDescriptor)) {
                await this.projectorRepo.addToPreview(resultDescriptor, projectors, options);
            } else if (action === `bulkAddToPreview` && isMultiProjectionBuildDescriptor(resultDescriptor)) {
                await this.projectorRepo.bulkAddToPreview(
                    this.createBulkActions(resultDescriptor),
                    projectors,
                    options
                );
            } else if (action === `hide` && isProjectionBuildDescriptor(resultDescriptor)) {
                if (this.projectorRepo.isProjectedOn(resultDescriptor, projectors[0])) {
                    await this.projectorRepo.toggle(resultDescriptor, projectors, options);
                }
            } else {
                throw new Error(`Unknown projector action ` + action);
            }
        }
    }

    private createBulkActions(descriptor: MultiProjectionBuildDescriptor): ProjectionBuildDescriptor[] {
        const projectionDefault = descriptor.projectionDefault;
        const getDialogTitle = descriptor.getDialogTitle;
        const descriptors: ProjectionBuildDescriptor[] = [];
        for (const item of descriptor.content_object_ids) {
            descriptors.push({
                content_object_id: item,
                projectionDefault,
                getDialogTitle
            });
        }
        return descriptors;
    }
}
