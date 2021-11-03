import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';

import { AppConfig } from '../../core/definitions/app-config';
import { Tag } from '../../shared/models/tag/tag';
import { ViewTag } from './models/view-tag';

export const TagAppConfig: AppConfig = {
    name: `tag`,
    models: [
        {
            model: Tag,
            viewModel: ViewTag,
            searchOrder: 8,
            repository: TagRepositoryService
        }
    ]
};
