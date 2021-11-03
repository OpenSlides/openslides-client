import { Permission } from 'app/core/core-services/permission';
import { AppConfig } from 'app/core/definitions/app-config';

export const CinemaAppConfig: AppConfig = {
    name: `cinema`,
    models: [],
    mainMenuEntries: [
        {
            route: `autopilot`,
            displayName: `Autopilot`,
            icon: `sync`,
            weight: 150,
            permission: Permission.meetingCanSeeAutopilot
        }
    ]
};
