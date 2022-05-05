import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';
import { UserComponentsModule } from '../user-components.module';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { UserDeleteDialogComponent } from '../components';
import { GetUserRelatedModelsPresenterService } from 'src/app/gateways/presenter/get-user-related-models-presenter.service';
import { Ids } from 'src/app/domain/definitions/key-types';
import { Selectable } from 'src/app/domain/interfaces';

interface UserDeleteDialogOpenConfig {
    toRemove: ViewUser[];
    toDelete: Selectable[];
}

@Injectable({
    providedIn: UserComponentsModule
})
export class UserDeleteDialogService extends BaseDialogService<
    UserDeleteDialogComponent,
    UserDeleteDialogOpenConfig,
    boolean
> {
    public constructor(dialog: MatDialog, private userRelatedModelsPresenter: GetUserRelatedModelsPresenterService) {
        super(dialog);
    }

    public async open(data: UserDeleteDialogOpenConfig): Promise<MatDialogRef<UserDeleteDialogComponent, boolean>> {
        const toDelete = await this.userRelatedModelsPresenter.call({
            user_ids: data.toDelete.map(user => user.id)
        });
        for (const user of data.toDelete) {
            toDelete[user.id].name = user.getTitle();
        }

        const module = await import(`../user-components.module`).then(m => m.UserComponentsModule);

        return this.dialog.open(module.getComponent(), {
            ...mediumDialogSettings,
            data: { toDelete, toRemove: data.toRemove }
        });
    }
}
