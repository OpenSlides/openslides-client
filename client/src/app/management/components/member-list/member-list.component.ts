import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PblColumnDefinition } from '@pebula/ngrid';

import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewUser } from 'app/site/users/models/view-user';

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
        }
    ];

    public constructor(
        public repo: UserRepositoryService,
        protected componentServiceCollector: ComponentServiceCollector,
        private router: Router,
        private route: ActivatedRoute
    ) {
        super(componentServiceCollector);
        super.setTitle('Members');
    }

    public ngOnInit(): void {
        super.ngOnInit();
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            // viewModelCtor: ViewOrganization,
            viewModelCtor: ViewMeeting,
            /**
             * TODO: Requires orga users
             */
            ids: [1],
            follow: [
                {
                    idField: 'user_ids'
                }
            ],
            fieldset: []
        };
    }

    public createNewMember(): void {
        this.router.navigate(['create'], { relativeTo: this.route });
    }
}
