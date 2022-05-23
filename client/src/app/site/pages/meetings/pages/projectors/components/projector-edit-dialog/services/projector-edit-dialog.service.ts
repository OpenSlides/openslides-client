import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Projector } from 'src/app/domain/models/projector/projector';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ProjectorEditDialogComponent } from '../components/projector-edit-dialog/projector-edit-dialog.component';
import { ProjectorEditDialogModule } from '../projector-edit-dialog.module';

@Injectable({ providedIn: ProjectorEditDialogModule })
export class ProjectorEditDialogService extends BaseDialogService<
    ProjectorEditDialogComponent,
    ViewProjector,
    Partial<Projector>
> {
    public async open(data: ViewProjector): Promise<MatDialogRef<ProjectorEditDialogComponent, Partial<Projector>>> {
        const module = await import(`../projector-edit-dialog.module`).then(m => m.ProjectorEditDialogModule);
        return this.dialog.open(module.getComponent(), { data, ...largeDialogSettings });
    }
}
