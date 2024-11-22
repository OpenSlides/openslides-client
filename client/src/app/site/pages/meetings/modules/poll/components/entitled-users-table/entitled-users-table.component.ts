import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';

import { ParticipantControllerService } from '../../../../pages/participants/services/common/participant-controller.service';
import { EntitledUsersTableEntry } from '../../definitions/entitled-users-table-entry';
import { EntitledUsersListFilterService } from '../../services/entitled-user-filter.service';

@Component({
    selector: `os-entitled-users-table`,
    templateUrl: `./entitled-users-table.component.html`,
    styleUrls: [`./entitled-users-table.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class EntitledUsersTableComponent {
    private _isViewingThis = true;

    @Input()
    public set entitledUsersObservable(observable: Observable<EntitledUsersTableEntry[]>) {
        this._entitledUsersObservable = observable.pipe(
            map(entries =>
                entries.sort((entryA, entryB) =>
                    this.getNameFromEntry(entryA)?.localeCompare(this.getNameFromEntry(entryB))
                )
            )
        );
    }

    public get entitledUsersObservable(): Observable<EntitledUsersTableEntry[]> {
        return this._entitledUsersObservable;
    }

    private _entitledUsersObservable!: Observable<EntitledUsersTableEntry[]>;

    @Input()
    public set isViewingThis(value: boolean) {
        this._isViewingThis = value;
    }

    public get isViewingThis(): boolean {
        return this._isViewingThis;
    }

    @Input()
    public displayVoteWeight: boolean;

    public readonly permission = Permission;

    public filterPropsEntitledUsersTable = [
        `user.full_name`,
        `vote_delegated_to.full_name`,
        `user_merged_into`,
        `delegation_user_merged_into`,
        `voted_verbose`
    ];

    public constructor(
        private controller: ParticipantControllerService,
        public filter: EntitledUsersListFilterService
    ) {}

    private getNameFromEntry(entry: EntitledUsersTableEntry): string {
        return (entry.user ?? this.controller.getViewModel(entry.user_id))?.getShortName();
    }
}
