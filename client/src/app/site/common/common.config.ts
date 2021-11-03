import { Permission } from 'app/core/core-services/permission';

import { AppConfig } from '../../core/definitions/app-config';

export const CommonAppConfig: AppConfig = {
    name: `common`,
    mainMenuEntries: [
        {
            route: `/`,
            displayName: `Meetings`,
            icon: `apps`,
            weight: 0,
            hasDividerBelow: true,
            cssClass: `foreground-warn`
        },
        {
            route: `.`,
            displayName: `Home`,
            icon: `home`,
            weight: 100,
            permission: Permission.meetingCanSeeFrontpage
        }
    ]
};
