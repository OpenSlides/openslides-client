import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter, firstValueFrom, Observable } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { Selectable } from 'src/app/domain/interfaces';
import { GetForwardingMeetingsPresenter, GetForwardingMeetingsPresenterService } from 'src/app/gateways/presenter';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ViewCommittee } from 'src/app/site/pages/organization/pages/committees';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { MotionChangeRecommendationControllerService } from '../../../modules/change-recommendations/services';
import { getMotionForwardDataSubscriptionConfig } from '../../../motions.subscription';
import { MotionFormatService } from '../../../services/common/motion-format.service';
import { ViewMotion } from '../../../view-models';
import {
    MotionForwardDialogComponent,
    MotionForwardDialogReturnData
} from '../components/motion-forward-dialog/motion-forward-dialog.component';
import { MotionForwardDialogModule } from '../motion-forward-dialog.module';

@Injectable({
    providedIn: MotionForwardDialogModule
})
export class MotionForwardDialogService extends BaseDialogService<
    MotionForwardDialogComponent,
    ViewMotion[],
    MotionForwardDialogReturnData
> {
    public get forwardingCommitteesObservable(): Observable<(Partial<ViewCommittee> & Selectable)[]> {
        return this._forwardingCommitteesSubject;
    }

    public get forwardingMeetingIds(): number[] {
        return this._forwardingMeetings.flatMap(obj => obj.meetings?.map(m => +m.id));
    }

    private _forwardingCommitteesSubject = new BehaviorSubject<(Partial<ViewCommittee> & Selectable)[]>([]);

    private _forwardingMeetings: GetForwardingMeetingsPresenter[] = [];
    private _forwardingMeetingsUpdateRequired = true;

    public constructor(
        private translate: TranslateService,
        private repo: MotionRepositoryService,
        private changeRecoRepo: MotionChangeRecommendationControllerService,
        private formatService: MotionFormatService,
        private snackbar: MatSnackBar,
        private presenter: GetForwardingMeetingsPresenterService,
        private activeMeeting: ActiveMeetingService,
        private operator: OperatorService,
        private modelRequest: ModelRequestService
    ) {
        super();

        this.activeMeeting.meetingIdObservable.subscribe(() => {
            this._forwardingMeetingsUpdateRequired = true;
        });
    }

    public async forwardingMeetingsAvailable(): Promise<boolean> {
        await this.updateForwardMeetings();

        return !!this._forwardingMeetings.length;
    }

    public async open(
        data: ViewMotion[]
    ): Promise<MatDialogRef<MotionForwardDialogComponent, MotionForwardDialogReturnData>> {
        await this.updateForwardMeetings();

        const module = await import(`../motion-forward-dialog.module`).then(m => m.MotionForwardDialogModule);
        return this.dialog.open(module.getComponent(), {
            ...mediumDialogSettings,
            autoFocus: false,
            data: {
                motion: data,
                forwardingMeetings: this._forwardingMeetings
            }
        });
    }

    public async forwardMotionsToMeetings(...motions: ViewMotion[]): Promise<void> {
        const toForward = motions.filter(motion => motion.state?.allow_motion_forwarding);
        const amountSelectedAmendments = toForward.filter(motion => motion.isAmendment()).length;

        if (toForward.filter(motion => !motion.isAmendment()).length === 0) {
            this.snackbar.open(this.translate.instant(`None of the selected motions can be forwarded.`), `Ok`);
            return;
        }
        const dialogRef = await this.open(toForward);
        const dialogData = (await firstValueFrom(dialogRef.afterClosed())) as MotionForwardDialogReturnData;
        const toMeetingIds = dialogData?.meetingIds as Ids;
        if (toMeetingIds) {
            try {
                const motionIds = toForward.map(motion => motion.id);
                await this.modelRequest.fetch(getMotionForwardDataSubscriptionConfig(...motionIds));
                const forwardMotions = toForward.map(motion =>
                    this.formatService.formatMotionForForward(
                        this.repo.getViewModel(motion.id),
                        dialogData.useOriginalVersion
                    )
                );
                const result = await this.repo.createForwarded(
                    toMeetingIds,
                    dialogData.useOriginalSubmitter,
                    dialogData.useOriginalNumber,
                    dialogData.useOriginalVersion,
                    dialogData.withAttachments,
                    dialogData.markAmendmentsAsForwarded,
                    ...forwardMotions
                );

                let numToForwardAmendments = 0;
                if (dialogData.useOriginalVersion) {
                    toForward.forEach(motion =>
                        motion.amendments.forEach(
                            amendment =>
                                (numToForwardAmendments +=
                                    amendment.state?.allow_amendment_forwarding && amendment.isAmendment() ? 1 : 0)
                        )
                    );
                }
                const numToForwardCR =
                    dialogData.useOriginalVersion && toForward.length === 1
                        ? toForward[0].change_recommendations.length
                        : 0;
                this.snackbar.open(
                    this.createForwardingSuccessMessage(
                        toForward.length - amountSelectedAmendments,
                        numToForwardAmendments,
                        numToForwardCR,
                        result
                    ),
                    `Ok`
                );
            } catch (e: any) {
                this.snackbar.open(e.toString(), `Ok`);
            }
        }
    }

    private async updateForwardMeetings(): Promise<void> {
        if (this._forwardingMeetingsUpdateRequired && !this.activeMeeting.meeting.isArchived) {
            const meetingId = await firstValueFrom(
                this.activeMeeting.meetingIdObservable.pipe(filter(id => id !== undefined))
            );
            const meetings =
                this.operator.hasPerms(Permission.motionCanForward) && !!meetingId
                    ? await this.presenter.call({ meeting_id: meetingId })
                    : [];
            this._forwardingMeetings = meetings;
            this._forwardingMeetingsUpdateRequired = false;
            this._forwardingCommitteesSubject.next(
                meetings.map(committee => {
                    return {
                        id: committee.id,
                        name: committee.name,
                        getTitle: (): string => committee.name,
                        getListTitle: (): string => ``,
                        toString: (): string => committee.name
                    };
                })
            );
        }
    }

    private createForwardingSuccessMessage(
        selectedMotionsLength: number,
        forwardedAmendmentsAmount: number,
        forwardedCRsAmount: number,
        result: { success: number; partial: number }
    ): string {
        const ofTranslated = this.translate.instant(`of`);
        const andTranslated = this.translate.instant(`and`);
        const wereTranslated =
            selectedMotionsLength === 1 && forwardedAmendmentsAmount === 0 && forwardedCRsAmount === 0
                ? this.translate.instant(`was`)
                : this.translate.instant(`were`);

        const successfulMessage = wereTranslated + ` ` + this.translate.instant(`successfully forwarded`);
        const partialMessage = this.translate.instant(`partially forwarded`);

        const verboseNameMotions = this.translate.instant(this.repo.getVerboseName(selectedMotionsLength !== 1));
        const verboseNameAmendments = this.translate.instant(
            this.repo.getVerboseName(forwardedAmendmentsAmount !== 1, true)
        );
        const verboseNameCR = this.translate.instant(this.changeRecoRepo.getVerboseName(forwardedCRsAmount !== 1));

        const additionalInfoMotions = selectedMotionsLength !== 1 ? `${ofTranslated} ${selectedMotionsLength} ` : ``;
        const additionalInfoAmendments =
            forwardedAmendmentsAmount === 0
                ? ``
                : `${andTranslated} ${forwardedAmendmentsAmount} ${verboseNameAmendments} `;
        const additionalInfoCR =
            forwardedCRsAmount === 0 ? `` : `${andTranslated} ${forwardedCRsAmount} ${verboseNameCR} `;

        let resultString = ``;
        if (result.success || !result.partial) {
            resultString = `${result.success} ${additionalInfoMotions}${verboseNameMotions} ${additionalInfoAmendments} ${additionalInfoCR} ${successfulMessage}`;
        }
        if (result.partial) {
            resultString = `${resultString}${result.success && result.partial ? `, ` : ``} ${result.partial} ${additionalInfoMotions} ${!result.success ? verboseNameMotions : ``} ${additionalInfoAmendments} ${additionalInfoCR} ${partialMessage}`;
        }

        return resultString;
    }
}
