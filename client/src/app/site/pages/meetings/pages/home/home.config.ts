import { Permission } from 'src/app/domain/definitions/permission';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

export const HomeAppConfig: AppConfig = {
    name: `common`,
    meetingMenuMentries: [
        {
            route: ``,
            displayName: `Home`,
            icon: `home`,
            weight: 100,
            permission: Permission.meetingCanSeeFrontpage
        }
    ]
};
