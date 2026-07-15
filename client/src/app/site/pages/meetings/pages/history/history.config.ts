import { Permission } from '@app/domain/definitions/permission';
import { HistoryEntry } from '@app/domain/models/history-entry/history-entry';
import { HistoryPosition } from '@app/domain/models/history-position/history-position';
import { HistoryEntryRepositoryService } from '@app/gateways/repositories/history-entry/history-entry-repository.service';
import { ViewHistoryEntry } from '@app/gateways/repositories/history-entry/view-history-entry';
import { HistoryPositionRepositoryService } from '@app/gateways/repositories/history-position/history-position-repository.service';
import { ViewHistoryPosition } from '@app/gateways/repositories/history-position/view-history-position';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

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
    ],
    models: [
        {
            model: HistoryPosition,
            viewModel: ViewHistoryPosition,
            repository: HistoryPositionRepositoryService
        },
        {
            model: HistoryEntry,
            viewModel: ViewHistoryEntry,
            repository: HistoryEntryRepositoryService
        }
    ]
};
