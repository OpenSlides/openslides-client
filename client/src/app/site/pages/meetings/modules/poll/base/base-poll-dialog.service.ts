import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PollContentObject } from 'src/app/domain/models/poll';
import { PollCreatePayload } from 'src/app/gateways/vote-api.service';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { PollDialogData } from 'src/app/site/pages/meetings/modules/poll/definitions';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

@Injectable({ providedIn: 'root' })
export abstract class BasePollDialogService<V extends PollContentObject, C = any> {
    private controller = inject(PollControllerService);
    private dialogService = inject(MatDialog);

    public async open(data: Partial<PollDialogData> | ViewPoll<V>): Promise<void> {
        const dialogRef = this.dialogService.open<C, Partial<PollDialogData> | ViewPoll<V>, Partial<PollCreatePayload>>(
            this.getComponent(),
            {
                ...mediumDialogSettings,
                data
            }
        );

        const result = await firstValueFrom(dialogRef.afterClosed());
        if (result) {
            if (data instanceof ViewPoll) {
                this.update(result, data);
            } else {
                this.create(result, data);
            }
        }
    }

    protected async create(payload: any, data: Partial<PollDialogData>): Promise<void> {
        await this.controller.create(data.content_object, payload);
    }

    protected async update(payload: any, poll: ViewPoll): Promise<void> {
        await this.controller.update(poll, payload);
    }

    protected abstract getComponent(): ComponentType<C>;
}
