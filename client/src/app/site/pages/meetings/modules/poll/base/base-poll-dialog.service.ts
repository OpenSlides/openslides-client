import { ComponentType } from '@angular/cdk/portal';
import { inject, Service } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PollContentObject } from '@app/domain/models/poll';
import { mediumDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { PollDialogData, PollDialogResult } from '@app/site/pages/meetings/modules/poll/definitions';
import { PollControllerService } from '@app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls';
import { firstValueFrom } from 'rxjs';

@Service()
export abstract class BasePollDialogService<V extends PollContentObject, C = any> {
    private controller = inject(PollControllerService);
    private dialogService = inject(MatDialog);

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
