import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PollContentObject } from 'src/app/domain/models/poll';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { PollDialogData, PollDialogResult } from 'src/app/site/pages/meetings/modules/poll/definitions';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { PollServiceModule } from '../services/poll-service.module';

@Injectable({ providedIn: PollServiceModule })
export abstract class BasePollDialogService<V extends PollContentObject, C = any> {
    public constructor(private controller: PollControllerService, private dialogService: MatDialog) {}

    public async open(data: Partial<PollDialogData> | ViewPoll<V>): Promise<void> {
        const dialogRef = this.dialogService.open<C, Partial<PollDialogData> | ViewPoll<V>, PollDialogResult>(
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
                this.create(result);
            }
        }
    }

    protected async create(payload: any): Promise<void> {
        await this.controller.create(payload);
    }

    protected async update(payload: any, poll: ViewPoll): Promise<void> {
        await this.controller.update(payload, poll);
    }

    protected abstract getComponent(): ComponentType<C>;
}
