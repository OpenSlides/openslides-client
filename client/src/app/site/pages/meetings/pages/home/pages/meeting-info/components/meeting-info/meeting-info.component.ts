import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { filter, firstValueFrom, map } from 'rxjs';
import { FULL_FIELDSET } from 'src/app/domain/fieldsets/misc';
import { OrganizationRepositoryService } from 'src/app/gateways/repositories/organization-repository.service';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
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
        return this.operator.isSuperAdmin || this.operator.isOrgaManager || this.operator.isMeetingAdmin;
    }

    public get osIsMeetingAdmin(): boolean {
        return this.operator.isMeetingAdmin;
    }

    public constructor(
        protected override translate: TranslateService,
        private orgaRepo: OrganizationRepositoryService,
        private operator: OperatorService
    ) {
        super();
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
                            idField: `speaker_ids`,
                            fieldset: [`id`, `begin_time`, `end_time`],
                            follow: [
                                {
                                    idField: `structure_level_list_of_speakers_id`,
                                    fieldset: FULL_FIELDSET
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
                                    follow: [
                                        {
                                            idField: `meeting_user_id`,
                                            fieldset: [`user_id`],
                                            follow: [
                                                {
                                                    idField: `structure_level_ids`,
                                                    fieldset: [`name`]
                                                }
                                            ]
                                        },
                                        {
                                            idField: `structure_level_list_of_speakers_id`,
                                            fieldset: FULL_FIELDSET,
                                            follow: [
                                                {
                                                    idField: `structure_level_id`,
                                                    fieldset: [`name`]
                                                }
                                            ]
                                        }
                                    ]
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
