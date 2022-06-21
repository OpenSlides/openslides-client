import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { BasePollDetailComponent, BaseVoteData } from '../../base/base-poll-detail.component';
import { PollService } from '../../services/poll.service';

@Component({
    selector: `os-votes-table`,
    templateUrl: `./votes-table.component.html`,
    styleUrls: [`./votes-table.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class VotesTableComponent {
    private _isViewingThis: boolean = true;

    @Input()
    public votesDataObservable!: Observable<BaseVoteData[]>;

    @Input()
    public listStorageKey!: string;

    @Input()
    public set isViewingThis(value: boolean) {
        this._isViewingThis = value;
    }

    @Input()
    public parent: BasePollDetailComponent<BaseViewModel, PollService>;

    public get isViewingThis(): boolean {
        return this._isViewingThis;
    }

    public readonly permission = Permission;

    public filterPropsSingleVotesTable = [`user.full_name`, `valueVerbose`];

    public getVoteIcon(voteValue: string): string {
        return this.parent.voteOptionStyle[voteValue]?.icon;
    }

    public getVoteCSS(voteValue: string): string {
        return this.parent.voteOptionStyle[voteValue]?.css;
    }
}
