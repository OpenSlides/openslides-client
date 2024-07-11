import { Injectable } from '@angular/core';
import { Data } from '@angular/router';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Permission } from 'src/app/domain/definitions/permission';
import { Settings } from 'src/app/domain/models/meetings/meeting';

import { ActiveMeetingService } from '../pages/meetings/services/active-meeting.service';
import { MeetingSettingsService } from '../pages/meetings/services/meeting-settings.service';
import { OpenSlidesRouterService } from './openslides-router.service';
import { OperatorService } from './operator.service';

@Injectable({
    providedIn: `root`
})
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

    public constructor(
        private operator: OperatorService,
        private activeMeeting: ActiveMeetingService,
        private meetingSettingsService: MeetingSettingsService,
        private osRouter: OpenSlidesRouterService
    ) {}

    public async isAuthorized(routeData: Data): Promise<boolean> {
        const basePerm: Permission[] = routeData[`meetingPermissions`];
        const omlPermissions: OML[] = routeData[`omlPermissions`];
        if (!basePerm && !omlPermissions) {
            return true;
        }
        const meetingSetting: keyof Settings = routeData[`meetingSetting`];
        const hasPerm = await this.hasPerms(basePerm, omlPermissions);
        const hasSetting = this.isMeetingSettingEnabled(meetingSetting);
        return hasPerm && hasSetting;
    }

    public async isAuthenticated(): Promise<boolean> {
        await this.operator.ready;
        return (this.operator.isAnonymous && this.activeMeeting.guestsEnabled) || this.operator.isAuthenticated;
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
        if (Number.isNaN(Number(meetingIdString))) {
            return false;
        }
        await this.operator.ready;
        return this.operator.isInMeeting(Number(meetingIdString)) || this.operator.isSuperAdmin;
    }

    private async hasPerms(basePerm: Permission | Permission[], omlPerm?: OML | OML[]): Promise<boolean> {
        await this.operator.ready;
        let result = true;
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
