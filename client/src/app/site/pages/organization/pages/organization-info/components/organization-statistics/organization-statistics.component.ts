import { Component, OnInit } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

@Component({
    selector: `os-organization-statistics`,
    templateUrl: `./organization-statistics.component.html`,
    styleUrls: [`./organization-statistics.component.scss`]
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
        private userController: UserControllerService,
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService
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
