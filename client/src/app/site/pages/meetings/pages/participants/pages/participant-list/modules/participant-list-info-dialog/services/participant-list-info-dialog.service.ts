import { inject, Service } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Id } from '@app/domain/definitions/key-types';
import { Permission } from '@app/domain/definitions/permission';
import { Identifiable } from '@app/domain/interfaces';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { OperatorService } from '@app/site/services/operator.service';
import { BaseDialogService } from '@app/ui/base/base-dialog-service';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { _ } from '@ngx-translate/core';

import { ParticipantControllerService } from '../../../../../services/common/participant-controller.service';
import { areGroupsDiminished } from '../../../components/participant-list/participant-list.component';
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
    private operator = inject(OperatorService);
    private prompt = inject(PromptService);
    private participantRepo = inject(ParticipantControllerService);

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

    public async openDialog(user: ViewUser, meeting: Parameters<typeof areGroupsDiminished>[2]): Promise<void> {
        const data: Partial<InfoDialog> & Identifiable = this.userEditDataBuilder(user);
        const dialogRef = await this.open(data);
        dialogRef.afterClosed().subscribe(async result => {
            if (!result) return;
            if (!result.group_ids?.length) result.group_ids = [meeting.default_group_id];
            if (result.vote_delegated_to_id === 0) result.vote_delegated_to_id = null;

            const isDiminishingOwnGroups =
                user.id === this.operator.operatorId &&
                areGroupsDiminished(this.operator.user.group_ids(), result.group_ids, meeting);
            if (isDiminishingOwnGroups) {
                const confirmed = await this.prompt.open(
                    _(`This action will remove you from one or more groups.`),
                    _(
                        `This may diminish your ability to do things in this meeting and you may not be able to revert it by yourself. Are you sure you want to do this?`
                    )
                );
                if (!confirmed) return;
            }
            if (
                this.operator.hasPerms(Permission.userCanEditOwnDelegation) &&
                !this.operator.hasPerms(Permission.userCanManage) &&
                !this.operator.hasPerms(Permission.userCanUpdate) &&
                user.id === this.operator.operatorId
            ) {
                await this.participantRepo.updateSelfDelegation(result, user);
            } else {
                this.participantRepo.update(result, user).resolve();
            }
        });
    }

    private userEditDataBuilder(user: ViewUser): Partial<InfoDialog> & Identifiable {
        return {
            id: user.id,
            name: user.getName(),
            number: user.number(),
            group_ids: user.group_ids(),
            structure_level_ids: user.structure_level_ids() || [],
            vote_delegations_from_ids: user.vote_delegations_from_meeting_user_ids() || [],
            vote_delegated_to_id: user.vote_delegated_to_meeting_user_id()
        };
    }
}
