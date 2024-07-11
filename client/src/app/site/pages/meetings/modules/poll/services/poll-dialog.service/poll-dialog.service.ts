import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';

import { PollServiceModule } from '../poll-service.module';

@Injectable({
    providedIn: PollServiceModule
})
export class PollDialogService {
    public constructor(private dialog: MatDialog) {}

    public async open<T = any, R = any, C = any>(
        dialogComponent: ComponentType<C> | Promise<ComponentType<C>>,
        data: T
    ): Promise<R> {
        const component = await dialogComponent;
        const dialogRef = this.dialog.open(component, {
            data,
            ...mediumDialogSettings
        });
        return await firstValueFrom(dialogRef.afterClosed());
    }
}
