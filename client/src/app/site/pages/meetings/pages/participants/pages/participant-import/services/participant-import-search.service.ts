import { Service } from '@angular/core';
import { ListSearchService } from '@app/ui/modules/list/services/list-search.service';

import { ViewImportedParticipant } from '../view-models/view-participant-import';

@Service()
export class ParticipantImportPreviewSearchService extends ListSearchService<ViewImportedParticipant> {
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
