import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ProjectorCountdownDialogComponent } from '../components/projector-countdown-dialog/projector-countdown-dialog.component';
import { CountdownDialogData } from '../definitions';
import { ProjectorCountdownDialogModule } from '../projector-countdown-dialog.module';

@Injectable({ providedIn: ProjectorCountdownDialogModule })
export class ProjectorCountdownDialogService extends BaseDialogService<
    ProjectorCountdownDialogComponent,
    Partial<CountdownDialogData>,
    Partial<CountdownDialogData>
> {
    public async open({
        description = ``,
        title = ``,
        duration = ``,
        count = 0
    }: Partial<CountdownDialogData>): Promise<
        MatDialogRef<ProjectorCountdownDialogComponent, Partial<CountdownDialogData>>
    > {
        const module = await import(`../projector-countdown-dialog.module`).then(m => m.ProjectorCountdownDialogModule);
        return this.dialog.open(module.getComponent(), {
            data: { description, title, count, duration },
            ...infoDialogSettings
        });
    }
}
