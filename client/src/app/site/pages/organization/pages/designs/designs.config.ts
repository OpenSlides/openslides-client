import { ViewTheme } from './view-models/view-theme';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';
import { Theme } from 'src/app/domain/models/theme/theme';
import { ThemeRepositoryService } from 'src/app/gateways/repositories/themes/theme-repository.service';
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
