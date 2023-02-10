import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingDefinition, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { AccountListServiceModule } from '../account-list-service.module';

@Injectable({
    providedIn: AccountListServiceModule
})
export class AccountSortService extends BaseSortListService<ViewUser> {
    protected storageKey = `MemberList`;

    private staticSortOptions: OsSortingOption<ViewUser>[] = [
        { property: `full_name`, label: _(`Full name`) },
        { property: [`first_name`, `last_name`], label: _(`Given name`) },
        { property: [`last_name`, `first_name`], label: _(`Surname`) },
        { property: `is_active`, label: _(`Is active`) },
        { property: `default_number`, label: _(`Participant number`) },
        { property: `default_structure_level`, label: _(`Structure level`) },
        { property: `default_vote_weight`, label: _(`Vote weight`) },
        { property: `gender`, label: _(`Gender`) },
        { property: `id`, label: _(`Sequential number`) },
        { property: `numberOfMeetings`, label: _(`Amount of meetings`) },
        { property: `last_email_send`, label: _(`Last email sent`) },
        { property: `last_login`, label: _(`Last login`) }
    ];

    public constructor(translate: TranslateService, store: StorageService) {
        super(translate, store);
    }

    protected getSortOptions(): OsSortingOption<ViewUser>[] {
        return this.staticSortOptions;
    }
    protected async getDefaultDefinition(): Promise<OsSortingDefinition<ViewUser>> {
        return {
            sortProperty: [`first_name`, `last_name`],
            sortAscending: true
        };
    }
}
