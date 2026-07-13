import { Injectable } from '@angular/core';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { ListSearchService } from '@app/ui/modules/list/services/list-search.service';

@Injectable({
    providedIn: 'root'
})
export class AccountListSearchService extends ListSearchService<ViewUser> {
    public constructor() {
        super(
            [`short_name`, `username`, `email`, `saml_id`, `member_number`, `externalString`, `homeCommitteeName`],
            []
        );
    }
}
