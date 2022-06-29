import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';

import { EntitledUsersTableEntry } from '../../definitions/entitled-users-table-entry';

@Component({
    selector: `os-entitled-users-table`,
    templateUrl: `./entitled-users-table.component.html`,
    styleUrls: [`./entitled-users-table.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class EntitledUsersTableComponent {
    private _isViewingThis: boolean = true;

    @Input()
    public entitledUsersObservable!: Observable<EntitledUsersTableEntry[]>;

    @Input()
    public listStorageKey!: string;

    @Input()
    public set isViewingThis(value: boolean) {
        this._isViewingThis = value;
    }

    public get isViewingThis(): boolean {
        return this._isViewingThis;
    }

    public readonly permission = Permission;

    public filterPropsEntitledUsersTable = [`user.full_name`, `vote_delegated_to.full_name`, `voted_verbose`];
}
