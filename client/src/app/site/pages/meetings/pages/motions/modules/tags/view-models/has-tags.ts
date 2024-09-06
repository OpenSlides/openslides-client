import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasTagIds } from '../../../../../../../../domain/interfaces/has-tag-ids';
import { ViewTag } from './view-tag';

export type HasTags = HasTagIds &
    ViewModelRelations<{
        tags: ViewTag[];
    }>;
