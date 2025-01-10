import { Gender } from 'src/app/domain/models/gender/gender';
import { GenderRepositoryService } from 'src/app/gateways/repositories/gender/gender-repository.service';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

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
