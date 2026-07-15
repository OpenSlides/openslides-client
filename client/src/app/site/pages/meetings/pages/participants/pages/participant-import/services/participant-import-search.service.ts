import { Injectable } from '@angular/core';
import { ListSearchService } from '@app/ui/modules/list/services/list-search.service';

@Injectable({
    providedIn: 'root'
})
export class ParticipantImportPreviewSearchService extends ListSearchService<any> {
    public constructor() {
        super(
            [
                `short_name`,
                `first_name`,
                `username`,
                `email`,
                `saml_id`,
                `member_number`,
                `externalString`,
                `homeCommitteeName`,
                `gender`,
                `title`,
                `structure_level`
            ],
            []
        );
    }
}
