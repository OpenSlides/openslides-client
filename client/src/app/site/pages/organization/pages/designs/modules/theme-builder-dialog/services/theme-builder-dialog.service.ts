import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ThemeBuilderDialogModule } from '../theme-builder-dialog.module';

@Injectable({
    providedIn: ThemeBuilderDialogModule
})
export class ThemeBuilderDialogService extends BaseDialogService {
    public async open(data: any): Promise<MatDialogRef<any, any>> {
        const module = await import(`../theme-builder-dialog.module`);
        return this.dialog.open(module.ThemeBuilderDialogModule.getComponent(), { ...mediumDialogSettings, data });
    }
}
