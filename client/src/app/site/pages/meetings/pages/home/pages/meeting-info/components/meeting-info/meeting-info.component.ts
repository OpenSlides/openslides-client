import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { filter, firstValueFrom, map } from 'rxjs';
import { OrganizationRepositoryService } from 'src/app/gateways/repositories/organization-repository.service';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { OperatorService } from 'src/app/site/services/operator.service';

const INFO_SUBSCRIPTION = `meeting_info`;

@Component({
    selector: `os-meeting-info`,
    templateUrl: `./meeting-info.component.html`,
    styleUrls: [`./meeting-info.component.scss`]
})
export class MeetingInfoComponent extends BaseMeetingComponent implements OnInit {
    public get canSeeStatistics(): boolean {
        return this.osIsManager || this.osIsMeetingAdmin;
    }

    public get osIsManager(): boolean {
        return this.operator.isSuperAdmin || this.operator.isOrgaManager;
    }

    public get osIsMeetingAdmin(): boolean {
        return this.operator.isMeetingAdmin;
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private orgaRepo: OrganizationRepositoryService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
        firstValueFrom(this.activeMeetingIdService.meetingIdObservable.pipe(filter(val => !!val))).then(() =>
            this.modelRequestService.subscribeTo({
                modelRequest: {
                    viewModelCtor: ViewMeeting,
                    ids: [this.activeMeetingId],
                    follow: [
                        {
                            idField: `meeting_user_ids`,
                            fieldset: `groups`,
                            follow: [
                                { idField: `group_ids`, fieldset: [`name`, `meeting_id`] },
                                {
                                    idField: `user_id`,
                                    fieldset: [`meeting_user_ids`]
                                }
                            ]
                        },
                        {
                            idField: `list_of_speakers_ids`,
                            fieldset: [],
                            follow: [
                                {
                                    idField: `speaker_ids`,
                                    fieldset: [`begin_time`, `end_time`, `point_of_order`],
                                    follow: [`meeting_user_id`]
                                }
                            ]
                        }
                    ]
                },
                subscriptionName: `${INFO_SUBSCRIPTION}_${this.activeMeetingId}`,
                hideWhen: this.activeMeetingIdService.meetingIdChanged.pipe(map(id => !id))
            })
        );
    }

    public ngOnInit(): void {
        super.setTitle(`Legal notice`);
    }

    public async updateLegalNotice(text: string | null): Promise<void> {
        if (text) {
            await this.orgaRepo.update({ legal_notice: text });
        }
    }

    public async updatePrivacyPolicy(text: string | null): Promise<void> {
        if (text) {
            await this.orgaRepo.update({ privacy_policy: text });
        }
    }
}
