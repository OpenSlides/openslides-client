import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasOrganizationTagIds } from '../../../../../../domain/interfaces/has-organization-tag-ids';
import { ViewOrganizationTag } from './view-organization-tag';

export type HasOrganizationTags = HasOrganizationTagIds &
    ViewModelRelations<{
        organization_tags: ViewOrganizationTag[];
    }>;
