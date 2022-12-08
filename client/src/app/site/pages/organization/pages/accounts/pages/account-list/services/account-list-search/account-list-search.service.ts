import { Injectable } from '@angular/core';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ListSearchService } from 'src/app/ui/modules/list/services/list-search.service';

import { AccountListServiceModule } from '../account-list-service.module';

@Injectable({
    providedIn: AccountListServiceModule
})
export class AccountListSearchService extends ListSearchService<ViewUser> {
    constructor() {
        super([`short_name`, `username`, `email`], []);
    }
}
