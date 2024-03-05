import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
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

import { getMotionForwardDataSubscriptionConfig } from '../../../motions.subscription';
import { MotionFormatService } from '../../../services/common/motion-format.service';
import { ViewMotion } from '../../../view-models';
import { MotionForwardDialogComponent } from '../components/motion-forward-dialog/motion-forward-dialog.component';
import { MotionForwardDialogModule } from '../motion-forward-dialog.module';

@Injectable({
    providedIn: MotionForwardDialogModule
})
export class MotionForwardDialogService extends BaseDialogService<MotionForwardDialogComponent, ViewMotion[], Ids> {
    public get forwardingCommitteesObservable(): Observable<(Partial<ViewCommittee> & Selectable)[]> {
        return this._forwardingCommitteesSubject;
    }

    private _forwardingCommitteesSubject = new BehaviorSubject<(Partial<ViewCommittee> & Selectable)[]>([]);

    private _forwardingMeetings: GetForwardingMeetingsPresenter[] = [];
    private _forwardingMeetingsUpdateRequired = true;

    public constructor(
        private translate: TranslateService,
        private repo: MotionRepositoryService,
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

    public async open(data: ViewMotion[]): Promise<MatDialogRef<MotionForwardDialogComponent, Ids>> {
        await this.updateForwardMeetings();

        const module = await import(`../motion-forward-dialog.module`).then(m => m.MotionForwardDialogModule);
        return this.dialog.open(module.getComponent(), {
            ...mediumDialogSettings,
            data: {
                motion: data,
                forwardingMeetings: this._forwardingMeetings
            }
        });
    }

    public async forwardMotionsToMeetings(...motions: ViewMotion[]): Promise<void> {
        const toForward = motions.filter(motion => motion.state?.allow_motion_forwarding);
        if (toForward.length === 0) {
            this.snackbar.open(this.translate.instant(`None of the selected motions can be forwarded.`), `Ok`);
            return;
        }
        const dialogRef = await this.open(toForward);
        const toMeetingIds = (await firstValueFrom(dialogRef.afterClosed())) as Ids;
        if (toMeetingIds) {
            try {
                const motionIds = toForward.map(motion => motion.id);
                await this.modelRequest.fetch(getMotionForwardDataSubscriptionConfig(...motionIds));
                const forwardMotions = toForward.map(motion =>
                    this.formatService.formatMotionForForward(this.repo.getViewModel(motion.id))
                );
                const result = await this.repo.createForwarded(toMeetingIds, ...forwardMotions);
                this.snackbar.open(this.createForwardingSuccessMessage(motions.length, result), `Ok`);
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
                this.operator.hasPerms(Permission.motionCanManage) && !!meetingId
                    ? await this.presenter.call({ meeting_id: meetingId })
                    : [];
            this._forwardingMeetings = meetings;
            this._forwardingMeetingsUpdateRequired = false;
            this._forwardingCommitteesSubject.next(
                meetings.map(committee => {
                    return {
                        id: committee.id,
                        name: committee.name,
                        getTitle: () => committee.name,
                        getListTitle: () => ``,
                        toString: () => committee.name
                    };
                })
            );
        }
    }

    private createForwardingSuccessMessage(
        selectedMotionsLength: number,
        result: { success: number; partial: number }
    ): string {
        const ofTranslated = this.translate.instant(`of`);
        const successfulMessage = this.translate.instant(`successfully forwarded`);
        const partialMessage = this.translate.instant(`partially forwarded`);
        const verboseName = this.translate.instant(this.repo.getVerboseName(selectedMotionsLength !== 1));
        const additionalInfo = selectedMotionsLength !== 1 ? `${ofTranslated} ${selectedMotionsLength} ` : ``;

        let resultString = ``;
        if (result.success || !result.partial) {
            resultString = `${result.success} ${additionalInfo}${verboseName} ${successfulMessage}`;
        }
        if (result.partial) {
            resultString = `${resultString}${result.success && result.partial ? `, ` : ``}${
                result.partial
            } ${additionalInfo}${!result.success ? verboseName : ``} ${partialMessage}`;
        }

        return resultString;
    }
}
