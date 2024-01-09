import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Projector } from 'src/app/domain/models/projector/projector';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ProjectorEditDialogComponent } from '../components/projector-edit-dialog/projector-edit-dialog.component';
import { ProjectorEditDialogModule } from '../projector-edit-dialog.module';

@Injectable({ providedIn: ProjectorEditDialogModule })
export class ProjectorEditDialogService extends BaseDialogService<
    ProjectorEditDialogComponent,
    ViewProjector,
    Partial<Projector>
> {
    public constructor(private controller: ProjectorControllerService) {
        super();
    }

    public async open(
        projector: ViewProjector
    ): Promise<MatDialogRef<ProjectorEditDialogComponent, Partial<Projector>>> {
        const module = await import(`../projector-edit-dialog.module`).then(m => m.ProjectorEditDialogModule);
        return this.dialog.open(module.getComponent(), {
            data: {
                projector,
                applyChangesFn: (update: Partial<Projector>) => this.updateProjector(update, projector)
            },
            ...largeDialogSettings
        });
    }

    private async updateProjector(update: Partial<Projector>, projector: Projector): Promise<void> {
        await this.controller.update(update, projector);
    }
}
