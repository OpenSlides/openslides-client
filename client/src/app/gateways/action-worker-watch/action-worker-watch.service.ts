import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { ActionWorkerState } from 'src/app/domain/models/action-worker/action-worker';
import { idFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { WaitForActionReason, waitForActionReason } from 'src/app/site/modules/wait-for-action-dialog/definitions';
import { WaitForActionDialogService } from 'src/app/site/modules/wait-for-action-dialog/services/wait-for-action-dialog.service';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ActionWorkerRepositoryService } from '../repositories/action-worker/action-worker-repository.service';
import { ViewActionWorker } from '../repositories/action-worker/view-action-worker';

const getActionWorkerSubscriptionConfig = (ids: Id[]) => ({
    modelRequest: {
        viewModelCtor: ViewActionWorker,
        ids: ids,
        fieldset: DEFAULT_FIELDSET
    },
    subscriptionName: ACTION_WORKER_SUBSCRIPTION
});

const ACTION_WORKER_SUBSCRIPTION = `action_worker`;

@Injectable({
    providedIn: `root`
})
export class ActionWorkerWatchService {
    public get currentWorkerIds(): Id[] {
        return this._currentWorkerIds;
    }

    /**
     * Names of actions, for which the waitDialog should not be shown (if the action watcher handling is done manually in another component)
     */
    private _noDialogActionNames: string[] = [];

    private _currentWorkerIds: Id[] = [];
    private _workerSubject = new BehaviorSubject<ViewActionWorker[]>([]);
    private _workerObservable = this._workerSubject.asObservable();

    private _toBeDeleted: { workerId: number; timestamp: number }[] = [];

    private _waitingForDeletion: number[] = [];

    public constructor(
        private actionWorkerRepo: ActionWorkerRepositoryService,
        private modelRequestService: ModelRequestService,
        private dialogService: WaitForActionDialogService
    ) {
        this.actionWorkerRepo
            .getViewModelListObservable()
            .subscribe(workers =>
                this._workerSubject.next(workers.filter(worker => !this._waitingForDeletion.includes(worker.id)))
            );
    }

    public async watch<T>(originalResponse: HttpResponse<T>, watchActivity: boolean): Promise<HttpResponse<T>> {
        const actionName = originalResponse.body[`results`][0][0][`name`];
        const fqid: string = originalResponse.body[`results`][0][0][`fqid`];
        const id = idFromFqid(fqid);
        if (Number.isNaN(id)) {
            throw new Error(_(`Received invalid fqid for action worker: `) + actionName);
        }
        if (originalResponse.body[`results`][0][0][`written`] === false) {
            this.openWaitingPrompt(id, waitForActionReason.notWritten, actionName);
        }
        this.subscribeToWorker(id);
        let worker: ViewActionWorker;
        try {
            worker = await this.getFinishedWorker(id, watchActivity, true);
        } catch (e) {
            throw new Error(_(`Client has stopped watching worker: `) + actionName + ` (${e.message})`);
        }
        this.dialogService.removeAllDates(id);
        this.unsubscribeFromWorker(id);
        if (worker.state === ActionWorkerState.end) {
            if (worker.result?.success === false) {
                throw new HttpErrorResponse({
                    error: { ...worker.result },
                    url: originalResponse.url,
                    status: worker.result?.status_code,
                    statusText: worker.result?.message
                });
            } else {
                return new HttpResponse<T>({
                    body: worker.result,
                    headers: originalResponse.headers,
                    status: worker.result?.status_code,
                    url: originalResponse.url,
                    statusText: worker.result?.message
                });
            }
        }
        throw new HttpErrorResponse({
            error: {
                success: false,
                message: `${worker.name} aborted without any specific message`,
                url: originalResponse.url
            },
            status: worker.result.status_code,
            statusText: worker.result?.message
        });
    }

    /**
     * Stops the service from showing a wait dialog for a specific action if it could not be written, is slow, or is inactive.
     * Should only be used if the option to manage the handling of these specific action workers is done in a separate component.
     * @param actionName the (backend) name of the action for which there shouldn't be a dialog.
     */
    public disableWaitDialog(actionName: string) {
        if (!this._noDialogActionNames.find(name => name === actionName)) {
            this._noDialogActionNames.push(actionName);
        }
    }

    /**
     * May be used to reverse the effects of enableWaitDialog.
     */
    public enableWaitDialog(actionName: string) {
        const index = this._noDialogActionNames.findIndex(name => name === actionName);
        if (!(index === -1)) {
            this._noDialogActionNames.splice(index, 1);
        }
    }

    /**
     * Removes a worker from the currentWorkerIds.
     * May be called from outside this service, to force the client to stop watching a running worker.
     * If this worker is currently watched, the running watch command will throw an error "Client has stopped watching worker: <Action name>".
     */
    public async unsubscribeFromWorker(workerId: Id): Promise<void> {
        this._currentWorkerIds = this._currentWorkerIds.filter(id => id !== workerId);
        await this.markForWorkerDeletion([workerId]);
    }

    public async unsubscribeFromWorkers(workerIds: Ids): Promise<void> {
        this._currentWorkerIds = this._currentWorkerIds.filter(id => !workerIds.includes(id));
        await this.markForWorkerDeletion(workerIds);
    }

    public async unsubscribeFromAllWorkers(): Promise<void> {
        const ids = this._currentWorkerIds || [];
        this._currentWorkerIds = [];
        await this.refreshAutoupdateSubscription(ids);
    }

    private async markForWorkerDeletion(workerIds: number[]): Promise<void> {
        this._waitingForDeletion = this._waitingForDeletion.concat(workerIds);
        this._workerSubject.next(
            this._workerSubject.value.filter(worker => !this._waitingForDeletion.includes(worker.id))
        );
        if (!this._currentWorkerIds?.length) {
            await this.refreshAutoupdateSubscription(this._waitingForDeletion);
            this._waitingForDeletion = [];
        }
    }

    /**
     * Deletes all workers from _toBeDeleted that have been in there for more than 10 seconds.
     */
    private cleanup() {
        const toDelete = this._toBeDeleted
            .filter(date => (Date.now() - date.timestamp) / 1000 > 10)
            .map(date => date.workerId);
        if (toDelete.length) {
            this.actionWorkerRepo.deleteModels(toDelete);
            this._toBeDeleted = this._toBeDeleted.filter(
                date => !toDelete.find(deletedId => deletedId === date.workerId)
            );
        }
    }

    private async subscribeToWorker(id: number): Promise<void> {
        this._currentWorkerIds.push(id);
        this.refreshAutoupdateSubscription();
    }

    /**
     * Renews the autoupdateservice subscription to only include the current worker Ids or close if there arent any.
     * It will cue up the given old ids to be deleted, this will eventually happen through {@link cleanup},
     * some time after at least 10 seconds have passed (to ensure that all operations on these workers may finish before they are gone).
     * @param ids the ids of the workers that will be unsubscribed
     */
    private refreshAutoupdateSubscription(oldIds?: number[]): void {
        if (this._currentWorkerIds && this._currentWorkerIds.length) {
            this.modelRequestService.updateSubscribeTo(getActionWorkerSubscriptionConfig(this._currentWorkerIds));
        } else {
            this.modelRequestService.closeSubscription(ACTION_WORKER_SUBSCRIPTION);
        }
        if (oldIds) {
            this._toBeDeleted.concat(
                oldIds.map(id => {
                    return { workerId: id, timestamp: Date.now() };
                })
            );
        }
        this.cleanup();
    }

    private async getFinishedWorker(
        id: Id,
        watchActivity: boolean,
        throwErrorIfUnsubscribed = false
    ): Promise<ViewActionWorker> {
        if (throwErrorIfUnsubscribed && !this._currentWorkerIds.includes(id)) {
            throw new Error(`Trying to access a worker, without a subscription`);
        }
        let hasReportedInactivity = false;
        let hasReportedSlowness = false;
        const actionWorker = (
            await firstValueFrom(
                this._workerObservable.pipe(
                    filter(data => {
                        const date = data.find(worker => worker.id === id);
                        if (date && watchActivity) {
                            let reason: WaitForActionReason;
                            if (!hasReportedSlowness && date.isSlow) {
                                hasReportedSlowness = true;
                                reason = waitForActionReason.slow;
                            }
                            if (!hasReportedInactivity && date.hasPassedInactivityThreshold) {
                                hasReportedInactivity = true;
                                reason = waitForActionReason.inactive;
                            }
                            if (reason) {
                                this.openWaitingPrompt(id, reason, date.name);
                            }
                        }
                        return date && date.state !== ActionWorkerState.running;
                    })
                )
            )
        ).find(worker => worker.id === id);
        return actionWorker;
    }

    private openWaitingPrompt(workerId: number, reason: WaitForActionReason, workerName?: string) {
        const name = workerName || this.actionWorkerRepo.getViewModel(workerId)?.name;
        if (!this._noDialogActionNames.find(actionName => actionName === name)) {
            this.dialogService.addNewDialog(reason, { workerId, workerName: name });
        }
    }
}
