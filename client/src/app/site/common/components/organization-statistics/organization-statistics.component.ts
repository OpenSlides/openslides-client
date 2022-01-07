import { Component, OnInit } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { MemberService } from 'app/core/core-services/member.service';
import { OrganizationService } from 'app/core/core-services/organization.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { BaseComponent } from 'app/site/base/components/base.component';
import { Observable } from 'rxjs';

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

    public activeUsers: number;
    public maxUserObservable: Observable<number> = this.orgaSettings.get(`limit_of_users`);

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        private orgaService: OrganizationService,
        private orgaSettings: OrganizationSettingsService,
        private memberService: MemberService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.memberService
            .fetchAllActiveUsers()
            .then(activeUserAmount => (this.activeUsers = activeUserAmount))
            .catch(this.raiseError);
    }
}
