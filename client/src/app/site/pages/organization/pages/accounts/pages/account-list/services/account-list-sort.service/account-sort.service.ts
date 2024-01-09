import { Injectable, Injector, ProviderToken } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

@Injectable({
    providedIn: `root`
})
export class AccountSortService extends BaseSortListService<ViewUser> {
    protected storageKey = `MemberList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = UserRepositoryService;

    private staticSortOptions: OsSortingOption<ViewUser>[] = [
        { property: `full_name`, label: _(`Full name`), baseKeys: [`first_name`, `last_name`, `title`] },
        { property: [`first_name`, `last_name`], label: _(`Given name`) },
        { property: [`last_name`, `first_name`], label: _(`Surname`) },
        { property: `is_active`, label: _(`Is active`) },
        { property: `default_number`, label: _(`Participant number`) },
        { property: `default_structure_level`, label: _(`Structure level`) },
        { property: `default_vote_weight`, label: _(`Vote weight`) },
        { property: `gender`, label: _(`Gender`) },
        { property: `id`, label: _(`Sequential number`) },
        { property: `numberOfMeetings`, label: _(`Amount of meetings`), baseKeys: [`meeting_ids`] },
        { property: `last_email_sent`, label: _(`Last email sent`) },
        { property: `last_login`, label: _(`Last login`) }
    ];

    public constructor() {
        super({
            sortProperty: [`first_name`, `last_name`],
            sortAscending: true
        });
    }

    protected getSortOptions(): OsSortingOption<ViewUser>[] {
        return this.staticSortOptions;
    }
}
