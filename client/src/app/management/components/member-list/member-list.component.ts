import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PblColumnDefinition } from '@pebula/ngrid';

import { HttpService } from 'app/core/core-services/http.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { ViewCommittee } from 'app/site/event-management/models/view-committee';
import { ViewUser } from 'app/site/users/models/view-user';

interface GetUsersRequest {
    users: Id[];
}

@Component({
    selector: 'os-members',
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent extends BaseListViewComponent<ViewUser> implements OnInit {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'short_name',
            width: 'auto'
        },
        {
            prop: 'info',
            width: '65%'
        }
    ];

    public constructor(
        public repo: UserRepositoryService,
        protected componentServiceCollector: ComponentServiceCollector,
        private http: HttpService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        super(componentServiceCollector);
        super.setTitle('Members');
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.loadUsers();
    }

    public createNewMember(): void {
        this.router.navigate(['create'], { relativeTo: this.route });
    }

    public isCommitteeManager(user: ViewUser, committee: ViewCommittee): boolean {
        return user.committees_as_manager.includes(committee);
    }

    private async loadUsers(start_index: number = 0, entries: number = 10000): Promise<void> {
        const payload = [
            {
                presenter: 'get_users',
                data: {
                    start_index,
                    entries,
                    include_temporary: true
                }
            }
        ];
        try {
            const response = await this.http.post<GetUsersRequest[]>('/system/presenter/handle_request', payload);
            const request: SimplifiedModelRequest = {
                viewModelCtor: ViewUser,
                ids: response[0].users,
                fieldset: 'orga',
                follow: [{ idField: 'committee_as_manager_ids' }, { idField: 'committee_as_member_ids' }]
            };
            this.requestModels(request, 'load_users');
        } catch (e) {
            console.log('Error:', e);
        }
    }
}
