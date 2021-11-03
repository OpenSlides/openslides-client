import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { EntitledUsersEntry } from 'app/shared/models/poll/poll-constants';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { Observable } from 'rxjs';

export interface EntitledUsersTableEntry extends EntitledUsersEntry {
    user_id: number;
    user?: ViewUser;
    voted: boolean;
    voted_verbose: string;
    vote_delegated_to_id?: number;
    vote_delegated_to?: ViewUser;
}

@Component({
    selector: `os-entitled-users-table`,
    templateUrl: `./entitled-users-table.component.html`,
    styleUrls: [`./entitled-users-table.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class EntitledUsersTableComponent extends BaseComponent {
    @Input()
    public entitledUsersObservable: Observable<EntitledUsersTableEntry[]>;

    @Input()
    public listStorageKey: string;

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

    public filterPropsEntitledUsersTable = [`user.getFullName`, `vote_delegated_to.getFullName`, `voted_verbose`];

    public constructor(
        protected componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService
    ) {
        super(componentServiceCollector, translate);
    }
}
