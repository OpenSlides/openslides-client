import { Injectable } from '@angular/core';
import { AutoupdateService } from 'src/app/site/services/autoupdate';
import { Fqid } from 'src/app/domain/definitions/key-types';
import { Position } from '../definitions';
import { HistoryBannerComponent } from '../components/history-banner/history-banner.component';
import { BannerService } from 'src/app/site/modules/site-wrapper/services/banner.service';
import { NotifyService } from 'src/app/gateways/notify.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { combineLatest } from 'rxjs';
import { ActionService } from 'src/app/gateways/actions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private _isInHistoryMode = false;
    private _actionFnIndex: number | null = null;

    public constructor(
        _openslidesRouter: OpenSlidesRouterService,
        private autoupdateService: AutoupdateService,
        private bannerService: BannerService,
        private notify: NotifyService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private actions: ActionService,
        private snackBar: MatSnackBar
    ) {
        combineLatest([
            _openslidesRouter.beforeLeaveMeetingObservable,
            _openslidesRouter.beforeSignoutObservable
        ]).subscribe(() => {
            this.leaveHistoryMode();
        });
    }

    public async enterHistoryMode(fqid: Fqid, historyPosition: Position): Promise<void> {
        if (!this._isInHistoryMode) {
            this._isInHistoryMode = true; // Prevent going multiple times into the history mode
            this.bannerService.addBanner({ component: HistoryBannerComponent });
            this.notify.disconnect();
            this.setHistoryMode();
        }
        await this.loadHistoryPosition(fqid, historyPosition);
    }

    public leaveHistoryMode(): void {
        if (this._isInHistoryMode) {
            this._isInHistoryMode = false;
            this.removeActionFn();
            this.bannerService.removeBanner({ component: HistoryBannerComponent });
            this.autoupdateService.reconnect();
            this.notify.connect(this.activeMeetingIdService.meetingId!);
        }
    }

    private setHistoryMode(): void {
        this._actionFnIndex = this.actions.addBeforeActionFn(() => {
            if (this._isInHistoryMode) {
                this.snackBar.open(`You cannot make changes while in history mode`, `Ok`);
            }
            return this._isInHistoryMode;
        });
    }

    private removeActionFn(): void {
        if (this._actionFnIndex) {
            this.actions.removeBeforeActionFn(this._actionFnIndex);
            this._actionFnIndex = null;
        }
    }

    private async loadHistoryPosition(fqid: Fqid, historyPosition: Position): Promise<void> {
        this.autoupdateService.reconnect({ position: historyPosition.position });
    }
}
