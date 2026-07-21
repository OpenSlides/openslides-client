import { Permission } from '@app/domain/definitions/permission';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

export const HomeAppConfig: AppConfig = {
    name: `common`,
    meetingMenuMentries: [
        {
            route: `.`,
            displayName: `Home`,
            icon: `home`,
            weight: 100,
            permission: Permission.meetingCanSeeFrontpage
        }
    ]
};
