import { ActionWorker } from 'src/app/domain/models/action-worker/action-worker';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

export class ViewActionWorker extends BaseViewModel<ActionWorker> {
    public static COLLECTION = ActionWorker.COLLECTION;

    public get actionWorker(): ActionWorker {
        return this._model;
    }

    /**
     * Returns the time since the start of this action worker in milliseconds.
     */
    public get timeSinceCreation(): number {
        return -this.created + Date.now() / 1000;
    }

    /**
     * Returns the time since the last time the action workers activity was last confirmed to be active in milliseconds.
     */
    public get timeSinceLastActivityConfirmation(): number {
        return -this.timestamp + Date.now() / 1000;
    }

    /**
     * Returns true, if the worker timestamp is older than 20 seconds
     */
    public get hasPassedInactivityThreshold(): boolean {
        return this.timeSinceLastActivityConfirmation > 20;
    }

    /**
     * Returns true, if the worker timestamp is older than 300 seconds
     */
    public get hasPassedDeathThreshold(): boolean {
        return -this.timestamp + Date.now() / 1000 > 300;
    }

    /**
     * Returns true, if the worker is older than 2 seconds
     */
    public get isSlow(): boolean {
        return this.timeSinceCreation > 2;
    }
}
export interface ViewActionWorker extends ActionWorker {}
