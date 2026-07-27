import { inject, Service } from '@angular/core';
import { Data } from '@angular/router';
import { Id } from '@app/domain/definitions/key-types';
import { CML, OML } from '@app/domain/definitions/organization-permission';
import { Permission } from '@app/domain/definitions/permission';
import { Settings } from '@app/domain/models/meetings/meeting';
import { MeetingRepositoryService } from '@app/gateways/repositories/meeting-repository.service';
import { CookieService } from 'ngx-cookie-service';

import { ActiveMeetingService } from '../pages/meetings/services/active-meeting.service';
import { MeetingSettingsService } from '../pages/meetings/services/meeting-settings.service';
import { ViewMeeting } from '../pages/meetings/view-models/view-meeting';
import { AutoupdateService } from './autoupdate';
import { ModelRequestBuilderService } from './model-request-builder';
import { OpenSlidesRouterService } from './openslides-router.service';
import { OperatorService } from './operator.service';

@Service()
export class AuthCheckService {
    /**
     * The last url to be approved by the permission guard, will be automatically emptied after the first read.
     */
    public get lastSuccessfulUrl(): string {
        const url = this._lastSuccessfulUrl;
        this._lastSuccessfulUrl = null;
        return url;
    }

    public set lastSuccessfulUrl(successfulUrl: string | null) {
        this._lastSuccessfulUrl = successfulUrl;
    }

    private _lastSuccessfulUrl: string | null = null;

    private operator = inject(OperatorService);
    private activeMeeting = inject(ActiveMeetingService);
    private meetingRepo = inject(MeetingRepositoryService);
    private meetingSettingsService = inject(MeetingSettingsService);
    private autoupdate = inject(AutoupdateService);
    private cookie = inject(CookieService);
    private modelRequestBuilder = inject(ModelRequestBuilderService);
    private osRouter = inject(OpenSlidesRouterService);

    public async isAuthorized(routeData: Data): Promise<boolean> {
        const basePerm: Permission[] = routeData[`meetingPermissions`];
        const omlPermissions: OML[] = routeData[`omlPermissions`];
        const cmlPermissions: CML[] = routeData[`optionalCmlPermissions`];
        if (!basePerm && !omlPermissions && !cmlPermissions) {
            return true;
        }
        const meetingSetting: keyof Settings = routeData[`meetingSetting`];
        const hasPerm = await this.hasPerms(basePerm, omlPermissions, cmlPermissions);
        const hasSetting = this.isMeetingSettingEnabled(meetingSetting);
        return hasPerm && hasSetting;
    }

    public async isAuthenticated(info?: number | string): Promise<boolean> {
        let meetingIdString = info;
        if (typeof info === `string`) {
            meetingIdString = this.osRouter.getMeetingId(info);
        }

        await this.operator.ready;
        let meeting = this.activeMeeting.meeting;
        if (!Number.isNaN(Number(meetingIdString)) && +meetingIdString > 0) {
            await this.fetchMeetingIfNotExists(+meetingIdString);
            meeting = this.meetingRepo.getViewModel(+meetingIdString);
        }

        return (
            (!meeting && this.cookie.check(`anonymous-auth`)) ||
            (this.operator.isAnonymous && meeting?.enable_anonymous) ||
            this.operator.isAuthenticated
        );
    }

    public async isAuthorizedToSeeOrganization(): Promise<boolean> {
        await this.operator.ready;
        try {
            return this.operator.knowsMultipleMeetings || this.operator.hasOrganizationPermissions();
        } catch (e) {
            return false;
        }
    }

    /**
     * Checks if the operator has access to a specified meeting
     * @param info a number or string containing the meetingId of the meeting that is to be checked, or a full url (from which a meetingId can be extracted)
     * @returns true if the extracted meetingId represents a meeting, that the operator knows
     */
    public async hasAccessToMeeting(info: number | string): Promise<boolean> {
        let meetingIdString = info;
        if (typeof info === `string`) {
            meetingIdString = this.osRouter.getMeetingId(info);
        }
        if (Number.isNaN(Number(meetingIdString)) || +meetingIdString <= 0) {
            return false;
        }
        await this.fetchMeetingIfNotExists(+meetingIdString);

        await this.operator.ready;
        return this.operator.canSkipPermissionCheck || this.operator.hasMeetingAccess(Number(meetingIdString));
    }

    private async fetchMeetingIfNotExists(meetingId: Id): Promise<void> {
        if (!this.meetingRepo.getViewModel(meetingId)) {
            await this.autoupdate.single(
                await this.modelRequestBuilder.build({
                    ids: [meetingId],
                    viewModelCtor: ViewMeeting,
                    fieldset: [`enable_anonymous`, `name`, `committee_id`]
                }),
                `meeting_single`
            );
        }
    }

    private async hasPerms(
        basePerm: Permission | Permission[],
        omlPerm?: OML | OML[],
        cmlPerm?: CML | CML[]
    ): Promise<boolean> {
        await this.operator.ready;
        let result = true;
        if (cmlPerm) {
            const toCheck = Array.isArray(cmlPerm) ? cmlPerm : [cmlPerm];
            if (toCheck.includes(CML.can_manage) && this.operator.isAnyCommitteeManager) {
                return true;
            }
        }
        if (!!basePerm && !!this.activeMeeting.meetingId) {
            const toCheck = Array.isArray(basePerm) ? basePerm : [basePerm];
            await this.operator.groupPermissionsLoaded;
            result = this.operator.hasPerms(...toCheck);
        }
        if (!omlPerm) {
            return result;
        }
        const toCheck = Array.isArray(omlPerm) ? omlPerm : [omlPerm];
        return result && this.operator.hasOrganizationPermissions(...toCheck);
    }

    private isMeetingSettingEnabled(meetingSetting?: keyof Settings): boolean {
        if (!meetingSetting) {
            return true;
        }
        return this.meetingSettingsService.instant(meetingSetting) as boolean;
    }
}
