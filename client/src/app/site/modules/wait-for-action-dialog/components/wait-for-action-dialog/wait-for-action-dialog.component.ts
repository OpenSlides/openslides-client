import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { multiActionVerbose, titleVerbose, WaitForActionData, WaitForActionReason } from '../../definitions';
import { WaitForActionDialogService } from '../../services/wait-for-action-dialog.service';

@Component({
    selector: `os-wait-for-action-dialog`,
    templateUrl: `./wait-for-action-dialog.component.html`,
    styleUrls: [`./wait-for-action-dialog.component.scss`]
})
export class WaitForActionDialogComponent extends BaseUiComponent {
    public get currentTitle(): string {
        return titleVerbose[this.waitService.currentReason];
    }

    public get currentWorkerId(): number {
        if (this.sameTypeArrayLength) {
            return this._dataArraySubject.value[0]?.workerId;
        }
        return undefined;
    }

    public get currentWorkerName(): string {
        if (this.sameTypeArrayLength) {
            return this._dataArraySubject.value[0]?.workerName;
        }
        return ``;
    }

    public get sameTypeArrayLength(): number {
        return this._dataArraySubject.value?.length;
    }

    public get multiButtonNumber(): string {
        return this.sameTypeArrayLength > 1 ? `(${this.sameTypeArrayLength})` : ``;
    }

    public get multiWaitButtonLabel(): string {
        return multiActionVerbose[this.waitService.currentReason]?.wait;
    }

    public get multiStopButtonLabel(): string {
        return multiActionVerbose[this.waitService.currentReason]?.stop;
    }

    private _dataArraySubject = new BehaviorSubject<WaitForActionData[]>([]);

    private _currentData: Map<WaitForActionReason, WaitForActionData[]>;

    public constructor(private waitService: WaitForActionDialogService) {
        super();
        this.subscriptions.push(
            this.waitService.dataObservable.subscribe(data => {
                this._currentData = data;
                this.nextDataArray();
            }),
            this.waitService.currentReasonObservable.subscribe(reason => this.nextDataArray())
        );
    }

    public wait(all = false): void {
        this.waitService.wait(all);
    }

    public stop(all = false): void {
        this.waitService.stopWaiting(all);
    }

    private nextDataArray() {
        this._dataArraySubject.next(this._currentData.get(this.waitService.currentReason));
    }
}
