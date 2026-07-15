import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/site/base/base.component';
import { OrganizationService } from '@app/site/pages/organization/services/organization.service';
import { OrganizationSettingsService } from '@app/site/pages/organization/services/organization-settings.service';
import { UserControllerService } from '@app/site/services/user-controller.service';
import { _ } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Component({
    selector: `os-organization-statistics`,
    templateUrl: `./organization-statistics.component.html`,
    styleUrls: [`./organization-statistics.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OrganizationStatisticsComponent extends BaseComponent implements OnInit {
    public activeMeetingsText = _(`Active meetings`);
    public activeUsersText = _(`Active accounts`);

    public activeMeetings: number = this.orgaService.currentActiveMeetings;
    public maxMeetingsObservable: Observable<number> = this.orgaSettings.get(`limit_of_meetings`);

    public activeUsers: number | null = null;
    public maxUserObservable: Observable<number> = this.orgaSettings.get(`limit_of_users`);

    public constructor(
        private orgaService: OrganizationService,
        private orgaSettings: OrganizationSettingsService,
        private userController: UserControllerService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.userController
            .fetchAllActiveUsers()
            .then(activeUserAmount => (this.activeUsers = activeUserAmount))
            .catch(this.raiseError);
    }
}
