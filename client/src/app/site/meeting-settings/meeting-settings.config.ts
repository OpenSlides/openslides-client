import { Permission } from 'app/core/core-services/permission';

import { AppConfig } from '../../core/definitions/app-config';

export const SettingsAppConfig: AppConfig = {
    name: `settings`,
    mainMenuEntries: [
        {
            route: `settings`,
            displayName: `Settings`,
            icon: `settings`,
            weight: 1300,
            permission: Permission.meetingCanManageSettings
        }
    ]
};
