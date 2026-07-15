import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Id } from '@app/domain/definitions/key-types';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from '@app/ui/base/base-dialog-service';

import { PointOfOrderDialogComponent } from '../components/point-of-order-dialog/point-of-order-dialog.component';

export interface PointOfOrderData {
    note?: string;
    point_of_order_category_id?: Id;
}

@Injectable({
    providedIn: 'root'
})
export class PointOfOrderDialogService extends BaseDialogService<
    PointOfOrderDialogComponent,
    PointOfOrderData,
    PointOfOrderData
> {
    public async open(data?: PointOfOrderData): Promise<MatDialogRef<PointOfOrderDialogComponent, PointOfOrderData>> {
        const module = await import(`../point-of-order-dialog.module`).then(m => m.PointOfOrderDialogModule);
        return this.dialog.open(module.getComponent(), {
            data,
            ...infoDialogSettings,
            disableClose: false
        });
    }
}
