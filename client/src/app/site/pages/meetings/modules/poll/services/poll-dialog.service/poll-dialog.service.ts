import { Injectable, TemplateRef } from '@angular/core';
import { PollServiceModule } from '../poll-service.module';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { firstValueFrom } from 'rxjs';

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
