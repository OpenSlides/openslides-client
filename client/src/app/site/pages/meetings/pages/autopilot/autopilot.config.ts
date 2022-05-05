import { Permission } from 'src/app/domain/definitions/permission';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

export const AutopilotAppConfig: AppConfig = {
    name: `cinema`,
    models: [],
    meetingMenuMentries: [
        {
            route: `autopilot`,
            displayName: `Autopilot`,
            icon: `sync`,
            weight: 150,
            permission: Permission.meetingCanSeeAutopilot
        }
    ]
};
