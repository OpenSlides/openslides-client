import { Component } from '@angular/core';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { WaitForActionDialogService } from '../../services/wait-for-action-dialog.service';

@Component({
    selector: `os-stopped-waiting-for-action-dialog`,
    templateUrl: `./stopped-waiting-for-action-dialog.component.html`,
    styleUrls: [`./stopped-waiting-for-action-dialog.component.scss`]
})
export class StoppedWaitingForActionDialogComponent extends BaseUiComponent {
    public get showSnapshots(): boolean {
        return this._showSnapshots;
    }

    public get snapshots(): string {
        return this._snapshots;
    }

    private _showSnapshots = false;

    private _snapshots: string;

    public constructor(private waitService: WaitForActionDialogService) {
        super();
        this.subscriptions.push(
            this.waitService.snapshotsObservable.subscribe(
                array => (this._snapshots = array.map(snapshot => JSON.stringify(snapshot)).join(`;\n`))
            )
        );
    }

    public showReport(): void {
        this._showSnapshots = true;
    }

    public copySnapshots(): void {
        if (this.snapshots) {
            if (!navigator.clipboard) {
                try {
                    console.log(`Browser does not support Clipboard API. Copying through other means.`);
                    const elem = document.createElement(`textarea`);
                    elem.value = this.snapshots;
                    document.body.appendChild(elem);
                    elem.select();
                    document.execCommand(`copy`);
                    document.body.removeChild(elem);
                } catch (e) {
                    throw new Error(`Failed to copy token.`);
                }
            } else {
                navigator.clipboard.writeText(this.snapshots).catch(() => {
                    throw new Error(`Failed to copy token.`);
                });
            }
        } else {
            throw new Error(`Failed to find token.`);
        }
    }
}
