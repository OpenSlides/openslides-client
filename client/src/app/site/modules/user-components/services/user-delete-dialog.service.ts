import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
    GetUserRelatedModelsPresenterResult,
    GetUserRelatedModelsPresenterService
} from '@app/gateways/presenter/get-user-related-models-presenter.service';
import { mediumDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { BaseDialogService } from '@app/ui/base/base-dialog-service';
import { _ } from '@ngx-translate/core';

import { UserDeleteDialogComponent } from '../components';

interface UserDeleteDialogOpenConfig {
    toRemove: ViewUser[];
    toDelete: ViewUser[];
    relatedModelsResult?: GetUserRelatedModelsPresenterResult;
}

@Injectable({
    providedIn: 'root'
})
export class UserDeleteDialogService extends BaseDialogService<
    UserDeleteDialogComponent,
    UserDeleteDialogOpenConfig,
    boolean
> {
    public constructor(private userRelatedModelsPresenter: GetUserRelatedModelsPresenterService) {
        super();
    }

    public async open(data: UserDeleteDialogOpenConfig): Promise<MatDialogRef<UserDeleteDialogComponent, boolean>> {
        let result: GetUserRelatedModelsPresenterResult = {};
        if (data.relatedModelsResult !== undefined) {
            result = data.relatedModelsResult;
        } else if (data.toDelete.length > 0) {
            try {
                result = await this.userRelatedModelsPresenter.call({
                    user_ids: data.toDelete.map(user => user.id)
                });
            } catch (e) {
                result = data.toDelete.mapToObject(user => {
                    return {
                        [user.id]: {
                            name: user.getTitle(),
                            error: _(`Relevant information could not be accessed`)
                        }
                    };
                });
            }
        }
        const toDelete = data.toDelete.map(user => ({
            ...result[user.id],
            name: user.getTitle()
        }));

        const module = await import(`../user-components.module`).then(m => m.UserComponentsModule);

        return this.dialog.open(module.getComponent(), {
            ...mediumDialogSettings,
            data: { toDelete: toDelete, toRemove: data.toRemove }
        });
    }
}
