import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar, MatLegacySnackBarConfig as MatSnackBarConfig, MatLegacySnackBarRef as MatSnackBarRef } from '@angular/material/legacy-snack-bar';

import { ProgressSnackBarComponent } from '../components/progress-snack-bar/progress-snack-bar.component';
import { ProgressSnackBarServiceModule } from './progress-snack-bar-service.module';

@Injectable({
    providedIn: ProgressSnackBarServiceModule
})
export class ProgressSnackBarService {
    constructor(private matSnackBar: MatSnackBar) {}

    public async open(config?: MatSnackBarConfig): Promise<MatSnackBarRef<ProgressSnackBarComponent>> {
        const module = await import(`../progress-snack-bar.module`).then(m => m.ProgressSnackBarModule);
        return this.matSnackBar.openFromComponent(module.getComponent(), config);
    }

    public dismiss(): void {
        this.matSnackBar.dismiss();
    }
}
