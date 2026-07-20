import { ComponentType } from '@angular/cdk/portal';
import { inject, Service } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { mediumDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { firstValueFrom } from 'rxjs';

@Service()
export class PollDialogService {
    private dialog = inject(MatDialog);

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
