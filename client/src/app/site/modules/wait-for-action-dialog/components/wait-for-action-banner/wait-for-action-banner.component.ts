import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { titleVerbose, WaitForActionData, WaitForActionReason, waitForActionReason } from '../../definitions';
import { WaitForActionDialogService } from '../../services';

@Component({
    selector: `os-wait-for-action-banner`,
    templateUrl: `./wait-for-action-banner.component.html`,
    styleUrls: [`./wait-for-action-banner.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaitForActionBannerComponent extends BaseUiComponent {
    public get currentTitle(): string {
        return titleVerbose[this.waitService.currentReason];
    }

    public get currentWorkerName(): string {
        if (this.sameTypeArrayLength) {
            return this._dataArraySubject.value[0]?.workerName;
        }
        return ``;
    }

    public get isInactive(): boolean {
        return this.waitService.currentReason === waitForActionReason.inactive;
    }

    public get sameTypeArrayLength(): number {
        return this._dataArraySubject.value?.length;
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
            this.waitService.currentReasonObservable.subscribe(() => this.nextDataArray())
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
