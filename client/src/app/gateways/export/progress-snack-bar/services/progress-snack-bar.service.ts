import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';

import { ProgressSnackBarComponent } from '../components/progress-snack-bar/progress-snack-bar.component';

@Injectable({
    providedIn: `root`
})
export class ProgressSnackBarService {
    public constructor(private matSnackBar: MatSnackBar) {}

    public async open(config?: MatSnackBarConfig): Promise<MatSnackBarRef<ProgressSnackBarComponent>> {
        const module = await import(`../progress-snack-bar.module`).then(m => m.ProgressSnackBarModule);
        return this.matSnackBar.openFromComponent(module.getComponent(), config);
    }

    public dismiss(): void {
        this.matSnackBar.dismiss();
    }
}
