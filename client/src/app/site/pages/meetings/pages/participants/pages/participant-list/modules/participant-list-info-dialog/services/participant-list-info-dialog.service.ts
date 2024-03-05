import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ParticipantListInfoDialogComponent } from '../components/participant-list-info-dialog/participant-list-info-dialog.component';
import { ParticipantListInfoDialogModule } from '../participant-list-info-dialog.module';

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
    providedIn: ParticipantListInfoDialogModule
})
export class ParticipantListInfoDialogService extends BaseDialogService<
    ParticipantListInfoDialogComponent,
    Partial<InfoDialog>,
    InfoDialog
> {
    public async open(
        data: Partial<InfoDialog> & Identifiable
    ): Promise<MatDialogRef<ParticipantListInfoDialogComponent, InfoDialog>> {
        const module = await import(`../participant-list-info-dialog.module`).then(
            m => m.ParticipantListInfoDialogModule
        );
        const dialogRef = this.dialog.open(module.getComponent(), { data, ...infoDialogSettings });
        dialogRef.keydownEvents().subscribe(event => {
            if (event.key === `Enter` && event.shiftKey) {
                dialogRef.close(data);
            }
        });
        return dialogRef;
    }
}
