import { Gender } from '@app/domain/models/gender/gender';
import { GenderRepositoryService } from '@app/gateways/repositories/gender/gender-repository.service';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

import { ViewGender } from './view-models/view-gender';

export const GendersAppConfig: AppConfig = {
    name: `gender`,
    models: [
        {
            model: Gender,
            viewModel: ViewGender,
            repository: GenderRepositoryService
        }
    ]
};
