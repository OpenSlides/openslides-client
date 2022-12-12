import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { map, Observable } from 'rxjs';
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
    public set votesDataObservable(observable: Observable<BaseVoteData[]>) {
        this._votesDataObservable = observable.pipe(
            map(entries =>
                entries.sort((entryA, entryB) => entryA.user?.getName().localeCompare(entryB.user?.getName()))
            )
        );
    }

    @Input()
    public set isViewingThis(value: boolean) {
        this._isViewingThis = value;
    }

    @Input()
    public parent: BasePollDetailComponent<BaseViewModel, PollService>;

    @Input()
    public templateType: string = ``;

    public get isViewingThis(): boolean {
        return this._isViewingThis;
    }

    public get isCryptographic(): boolean {
        return this.parent?.poll?.isCryptographic;
    }

    public readonly permission = Permission;

    @Input()
    public filterProps = [`user.full_name`, `valueVerbose`];

    public get votesDataObservable(): Observable<BaseVoteData[]> {
        return this._votesDataObservable;
    }

    private _votesDataObservable!: Observable<BaseVoteData[]>;

    public getVoteIcon(voteValue: string): string {
        return this.parent.voteOptionStyle[voteValue]?.icon;
    }

    public getVoteCSS(voteValue: string): string {
        return this.parent.voteOptionStyle[voteValue]?.css;
    }

    public getTemplateType(): string {
        if ([`assignment`].includes(this.templateType.toLowerCase())) {
            return this.templateType.toLowerCase();
        }
        return `default`;
    }
}
