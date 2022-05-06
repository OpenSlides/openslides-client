import { Permission } from 'src/app/domain/definitions/permission';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

/**
 * Config object for history.
 * Hooks into the navigation.
 */
export const HistoryAppConfig: AppConfig = {
    name: `history`,
    meetingMenuMentries: [
        {
            route: `history`,
            displayName: `History`,
            icon: `history`,
            weight: 1200,
            permission: Permission.meetingCanSeeHistory,
            hasDividerBelow: true
        }
    ]
};
