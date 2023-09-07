import { Injectable, Injector } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ActionWorker } from 'src/app/domain/models/action-worker/action-worker';
import { ActionWorkerWatchService } from 'src/app/gateways/action-worker-watch/action-worker-watch.service';
import { ActionWorkerRepositoryService } from 'src/app/gateways/repositories/action-worker/action-worker-repository.service';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';

import { BannerService } from '../../site-wrapper/services/banner.service';
import { StoppedWaitingForActionDialogComponent } from '../components/stopped-waiting-for-action-dialog/stopped-waiting-for-action-dialog.component';
import { WaitForActionBannerComponent } from '../components/wait-for-action-banner/wait-for-action-banner.component';
import { WaitForActionData, WaitForActionReason } from '../definitions';
import { WaitForActionDialogModule } from '../wait-for-action-dialog.module';

@Injectable({
    providedIn: WaitForActionDialogModule
})
export class WaitForActionDialogService {
    public get currentReasonObservable(): Observable<WaitForActionReason> {
        return this._currentReasonObservable;
    }

    public get currentReason(): WaitForActionReason {
        return this._currentReasonSubject.value;
    }

    private set currentReason(reason: WaitForActionReason) {
        const oldReason = this.currentReason;
        if (oldReason !== reason) {
            this._currentReasonSubject.next(reason);
            if (oldReason === null) {
                this.openDialog();
            }
            if (reason === null) {
                this.closeDialog();
            }
        }
    }

    public get dataObservable(): Observable<Map<WaitForActionReason, WaitForActionData[]>> {
        return this._dataObservable;
    }

    public get snapshotsObservable(): Observable<(Partial<ActionWorker> & { closed: number })[]> {
        return this._snapshots;
    }

    private get workerWatch(): ActionWorkerWatchService {
        if (!this._workerWatch) {
            this._workerWatch = this.injector.get(ActionWorkerWatchService);
        }
        return this._workerWatch;
    }

    private _workerWatch: ActionWorkerWatchService;

    private _currentReasonSubject = new BehaviorSubject<WaitForActionReason>(null);
    private _currentReasonObservable = this._currentReasonSubject as Observable<WaitForActionReason>;
    private _dataSubject = new BehaviorSubject<Map<WaitForActionReason, WaitForActionData[]>>(new Map([]));
    private _dataObservable = this._dataSubject as Observable<Map<WaitForActionReason, WaitForActionData[]>>;

    private _dialog: MatDialogRef<StoppedWaitingForActionDialogComponent>;
    private _closingSubscription: Subscription;

    private _snapshots: BehaviorSubject<(Partial<ActionWorker> & { closed: number })[]> = new BehaviorSubject([]);

    public constructor(
        private injector: Injector,
        private dialog: MatDialog,
        private repo: ActionWorkerRepositoryService,
        private bannerService: BannerService
    ) {}

    public addNewDialog(reason: WaitForActionReason, data: WaitForActionData): void {
        this.removeAllDates(data.workerId);
        this._dataSubject.next(
            this._dataSubject.value.set(reason, (this._dataSubject.value.get(reason) || []).concat(data))
        );
        if (this.currentReason === null) {
            this.newCurrentReason();
        }
    }

    public async openClosingPrompt(snapshot: Partial<ActionWorker> & { closed: number }): Promise<void> {
        this._snapshots.next(this._snapshots.value.concat(snapshot));
        if (!this._dialog) {
            const module = await import(`../wait-for-action-dialog.module`).then(m => m.WaitForActionDialogModule);
            this._dialog = this.dialog.open(module.getComponent(), { ...infoDialogSettings });
            this._closingSubscription = this._dialog.afterClosed().subscribe(() => {
                this._snapshots.next([]);
                this._closingSubscription.unsubscribe();
            });
        }
    }

    /**
     * Will remove all prepared dialogs for the worker with the given workerId, even if they are currently being shown.
     */
    public removeAllDates(workerId: Id): void {
        while (
            this._dataSubject.value.get(this.currentReason) &&
            this._dataSubject.value.get(this.currentReason)[0].workerId === workerId
        ) {
            this.wait();
        }
        const newMap = this._dataSubject.value;
        newMap.forEach((value, key) => {
            newMap.set(
                key,
                value.filter(date => !(date.workerId === workerId))
            );
        });
        this._dataSubject.next(newMap);
        this.newCurrentReason();
    }

    public wait(all = false, _noConfirmation = false): WaitForActionData[] {
        const map = this._dataSubject.value;
        let removed: WaitForActionData[];
        if (all || map.get(this.currentReason).length === 1) {
            removed = map.get(this.currentReason);
            map.delete(this.currentReason);
        } else {
            removed = [map.get(this.currentReason)[0]];
            map.set(this.currentReason, map.get(this.currentReason).slice(1));
        }
        this._dataSubject.next(map);
        this.newCurrentReason();
        removed.forEach(date => {
            const worker = this.repo.getViewModel(date.workerId);
            if (worker) {
                worker.lastConfirmationToWaitTimestamp = Date.now();
            }
        });
        return removed;
    }

    public stopWaiting(all = false): void {
        const toStop = this.wait(all, true);
        this.workerWatch.unsubscribeFromWorkers(toStop.map(date => date.workerId));
    }

    /**
     * Closes the dialog and clears all waiting messages
     * @param kill if this is set to true, the client will stop listening to all action workers that are connected to one of the messages
     */
    public clear(kill = false): void {
        this._dataSubject.next(new Map([]));
        if (kill) {
            this.workerWatch.unsubscribeFromAllWorkers();
        }
        this.newCurrentReason();
    }

    private async openDialog() {
        this.bannerService.addBanner({ component: WaitForActionBannerComponent });
    }

    private closeDialog() {
        this.bannerService.removeBanner({ component: WaitForActionBannerComponent });
    }

    private newCurrentReason(): void {
        const keys = Array.from(this._dataSubject.value.keys()).sort((a, b) => a - b);
        this.currentReason = keys.length ? keys[0] : null;
    }
}
