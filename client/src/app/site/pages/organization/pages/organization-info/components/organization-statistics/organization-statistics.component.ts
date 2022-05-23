import { Component, OnInit } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

@Component({
    selector: `os-organization-statistics`,
    templateUrl: `./organization-statistics.component.html`,
    styleUrls: [`./organization-statistics.component.scss`]
})
export class OrganizationStatisticsComponent extends BaseUiComponent implements OnInit {
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
