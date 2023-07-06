import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewListOfSpeakers, ViewPointOfOrderCategory } from 'src/app/site/pages/meetings/pages/agenda';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { PointOfOrderDialogComponent } from '../components/point-of-order-dialog/point-of-order-dialog.component';
import { PointOfOrderDialogModule } from '../point-of-order-dialog.module';

interface PointOfOrderResult {
    note: string;
}

@Injectable({
    providedIn: PointOfOrderDialogModule
})
export class PointOfOrderDialogService extends BaseDialogService<
    PointOfOrderDialogComponent,
    ViewListOfSpeakers,
    PointOfOrderResult
> {
    public async open(
        data: ViewListOfSpeakers,
        category?: ViewPointOfOrderCategory
    ): Promise<MatDialogRef<PointOfOrderDialogComponent, PointOfOrderResult>> {
        const module = await import(`../point-of-order-dialog.module`).then(m => m.PointOfOrderDialogModule);
        return this.dialog.open(module.getComponent(), {
            data: { listOfSpeakers: data, category },
            ...infoDialogSettings,
            disableClose: false
        });
    }
}
