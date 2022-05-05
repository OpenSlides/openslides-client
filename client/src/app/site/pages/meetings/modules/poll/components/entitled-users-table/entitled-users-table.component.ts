import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { EntitledUsersTableEntry } from '../../definitions/entitled-users-table-entry';
import { PblColumnDefinition } from '@pebula/ngrid';
import { Permission } from 'src/app/domain/definitions/permission';

@Component({
    selector: 'os-entitled-users-table',
    templateUrl: './entitled-users-table.component.html',
    styleUrls: ['./entitled-users-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class EntitledUsersTableComponent {
    @Input()
    public entitledUsersObservable!: Observable<EntitledUsersTableEntry[]>;

    @Input()
    public listStorageKey!: string;

    public columnDefinitionEntitledUsersTable: PblColumnDefinition[] = [
        {
            prop: `user_id`,
            width: `40%`,
            label: `Participant`
        },
        {
            prop: `voted`,
            width: `30%`,
            label: `Voted`
        },
        {
            prop: `delegation`,
            width: `30%`,
            label: `Delegated to`
        }
    ];

    public readonly permission = Permission;

    public filterPropsEntitledUsersTable = [`user.full_name`, `vote_delegated_to.full_name`, `voted_verbose`];
}
