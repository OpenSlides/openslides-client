import { Permission } from 'src/app/domain/definitions/permission';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

export const SettingsAppConfig: AppConfig = {
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
