import { Service } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Id } from '@app/domain/definitions/key-types';
import { Permission } from '@app/domain/definitions/permission';
import { Identifiable } from '@app/domain/interfaces';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { ViewMeeting } from '@app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { OperatorService } from '@app/site/services/operator.service';
import { BaseDialogService } from '@app/ui/base/base-dialog-service';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { _ } from '@ngx-translate/core';

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

@Service()
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

export function areGroupsDiminished(oldGroupIds: number[], newGroupIds: number[], activeMeeting: ViewMeeting): boolean {
    return (
        oldGroupIds
            .filter(group => group !== activeMeeting.default_group_id)
            .some(id => !(newGroupIds ?? []).includes(id)) && !newGroupIds.includes(activeMeeting.admin_group_id)
    );
}

export function afterDialogClosed(
    dialogRef: MatDialogRef<ParticipantListInfoDialogComponent, InfoDialog>,
    user: ViewUser,
    operator: OperatorService,
    activeMeeting: ViewMeeting,
    repo: ParticipantControllerService,
    prompt: PromptService
): void {
    const selfGroupRemovalDialogTitle = _(`This action will remove you from one or more groups.`);
    const selfGroupRemovalDialogContent = _(
        `This may diminish your ability to do things in this meeting and you may not be able to revert it by youself. Are you sure you want to do this?`
    );

    dialogRef.afterClosed().subscribe(async result => {
        if (result) {
            if (!result.group_ids?.length) {
                result.group_ids = [this.activeMeeting!.default_group_id];
            }
            if (result.vote_delegated_to_id === 0) {
                result.vote_delegated_to_id = null;
            }
            if (
                !(
                    user.id === operator.operatorId &&
                    areGroupsDiminished(operator.user.group_ids(), result.group_ids, activeMeeting)
                ) ||
                (await prompt.open(selfGroupRemovalDialogTitle, selfGroupRemovalDialogContent))
            ) {
                if (
                    operator.hasPerms(Permission.userCanEditOwnDelegation) &&
                    !operator.hasPerms(Permission.userCanManage) &&
                    !operator.hasPerms(Permission.userCanUpdate) &&
                    user.id === operator.operatorId
                ) {
                    repo.updateSelfDelegation(result, user);
                } else {
                    repo.update(result, user).resolve();
                }
            }
        }
    });
}
