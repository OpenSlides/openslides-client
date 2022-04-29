import { AppConfig } from 'src/app/infrastructure/definitions/app-config';
import { Permission } from 'src/app/domain/definitions/permission';

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
