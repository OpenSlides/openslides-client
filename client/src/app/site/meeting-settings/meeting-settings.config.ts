import { AppConfig } from '../../core/definitions/app-config';
import { Permission } from 'app/core/core-services/operator.service';

export const SettingsAppConfig: AppConfig = {
    name: 'settings',
    mainMenuEntries: [
        {
            route: '/settings',
            displayName: 'Settings',
            icon: 'settings',
            weight: 1300,
            permission: Permission.coreCanManageSettings
        }
    ]
};
