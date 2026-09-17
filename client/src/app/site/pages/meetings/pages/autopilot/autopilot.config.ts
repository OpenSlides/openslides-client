import { Permission } from '@app/domain/definitions/permission';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

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
