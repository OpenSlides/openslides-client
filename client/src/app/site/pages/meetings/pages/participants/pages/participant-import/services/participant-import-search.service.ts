import { Service } from '@angular/core';
import { ListSearchService } from '@app/ui/modules/list/services/list-search.service';

import { BackendImportRowClass } from '../backend-import-row/backend-import-row-class';

@Service()
export class ParticipantImportPreviewSearchService extends ListSearchService<BackendImportRowClass> {
    public constructor() {
        super(
            [
                'email',
                'title',
                'gender',
                'groups',
                'number',
                'saml_id',
                'username',
                'first_name',
                'home_commitee',
                'member_number',
                'home_committee',
                'structure_level'
            ],
            []
        );
    }
}
