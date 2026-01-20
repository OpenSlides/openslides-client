import { Permission } from 'src/app/domain/definitions/permission';
import { HistoryEntry } from 'src/app/domain/models/history-entry/history-entry';
import { HistoryPosition } from 'src/app/domain/models/history-position/history-position';
import { HistoryEntryRepositoryService } from 'src/app/gateways/repositories/history-entry/history-entry-repository.service';
import { ViewHistoryEntry } from 'src/app/gateways/repositories/history-entry/view-history-entry';
import { HistoryPositionRepositoryService } from 'src/app/gateways/repositories/history-position/history-position-repository.service';
import { ViewHistoryPosition } from 'src/app/gateways/repositories/history-position/view-history-position';
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
