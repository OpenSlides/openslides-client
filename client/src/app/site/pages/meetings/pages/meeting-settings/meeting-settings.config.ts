import { Permission } from '@app/domain/definitions/permission';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

export const MeetingSettingsAppConfig: AppConfig = {
    name: `settings`,
    meetingMenuMentries: [
        {
            route: `settings`,
            displayName: `Settings`,
            icon: `settings`,
            weight: 1300,
            permission: Permission.meetingCanManageSettings
        }
    ]
};
