import { HistoryEntry } from "src/app/domain/models/history-entry/history-entry";
import { HistoryPosition } from "src/app/domain/models/history-position/history-position";
import { AppConfig } from "src/app/infrastructure/definitions/app-config";

import { HistoryEntryRepositoryService } from "../history-entry/history-entry-repository.service";
import { ViewHistoryEntry } from "../history-entry/view-history-entry";
import { HistoryPositionRepositoryService } from "./history-position-repository.service";
import { ViewHistoryPosition } from "./view-history-position";

export const HistoryAppConfig: AppConfig = {
    name: `history`,
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
