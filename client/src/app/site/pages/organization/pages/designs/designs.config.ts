import { Theme } from '@app/domain/models/theme/theme';
import { ThemeRepositoryService } from '@app/gateways/repositories/themes/theme-repository.service';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

import { ViewTheme } from './view-models/view-theme';
export const DesignsAppConfig: AppConfig = {
    name: `Designs`,
    models: [
        {
            model: Theme,
            viewModel: ViewTheme,
            repository: ThemeRepositoryService
        }
    ]
};
