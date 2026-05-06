import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ParticipantControllerService } from '../../../../../services/common/participant-controller.service';
import { ParticipantListInfoDialogComponent } from '../components/participant-list-info-dialog/participant-list-info-dialog.component';

/**
 * Interface for the short editing dialog.
 * Describe, which values the dialog has.
 */
export interface InfoDialog {
    id: Id;
    /**
     * The name of the user.
     */
    name: string;

    /**
     * Define all the groups the user is in.
     */
    group_ids: number[];

    /**
     * The participant number of the user.
     */
    number: string;

    /**
     * Structure level for one user.
     */
    structure_level_ids: number[];

    /**
     * Transfer voting rights from
     */
    vote_delegations_from_ids: number[];

    /**
     * Transfer voting rights to
     */
    vote_delegated_to_id: number;
}

@Injectable({
    providedIn: 'root'
})
export class ParticipantListInfoDialogService extends BaseDialogService<
    ParticipantListInfoDialogComponent,
    Partial<InfoDialog>,
    InfoDialog
> {
    public constructor(private controller: ParticipantControllerService) {
        super();
    }

    public async open(data: Partial<InfoDialog> & { user: ViewUser }): Promise<any> {
        const module = await import(`../participant-list-info-dialog.module`).then(
            m => m.ParticipantListInfoDialogModule
        );
        const dialogRef = this.dialog.open(module.getComponent(), { data, ...infoDialogSettings });
        dialogRef.keydownEvents().subscribe(event => {
            if (event.key === `Enter` && event.shiftKey) {
                dialogRef.close(data);
            }
        });
        const result = await firstValueFrom(dialogRef.afterClosed());
        result.vote_delegated_to_id = result.vote_delegated_to_id === 0 ? null : result.vote_delegated_to_id;
        this.update(result, data.user);
    }

    protected async update(payload: any, user: ViewUser | undefined): Promise<void> {
        await this.controller.update(payload, user).resolve();
    }
}
