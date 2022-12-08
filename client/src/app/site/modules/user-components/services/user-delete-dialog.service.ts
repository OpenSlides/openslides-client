import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Selectable } from 'src/app/domain/interfaces';
import {
    GetUserRelatedModelsPresenterResult,
    GetUserRelatedModelsPresenterService
} from 'src/app/gateways/presenter/get-user-related-models-presenter.service';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { UserDeleteDialogComponent } from '../components';
import { UserComponentsModule } from '../user-components.module';

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
        let toDelete: GetUserRelatedModelsPresenterResult;
        try {
            toDelete = await this.userRelatedModelsPresenter.call({
                user_ids: data.toDelete.map(user => user.id)
            });
        } catch (e) {
            toDelete = data.toDelete.mapToObject(user => {
                return {
                    [user.id]: {
                        name: user.getTitle(),
                        error: _(`Relevant information could not be accessed`)
                    }
                };
            });
        }
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
