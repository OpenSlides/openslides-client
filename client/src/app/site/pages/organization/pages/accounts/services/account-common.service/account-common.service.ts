import { Injectable } from '@angular/core';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Ids } from 'src/app/domain/definitions/key-types';
import { OperatorService } from 'src/app/site/services/operator.service';
import { GetUsersPresenterService } from 'src/app/gateways/presenter';

@Injectable({
    providedIn: 'root'
})
export class AccountCommonService {
    public constructor(private operator: OperatorService, private usersPresenter: GetUsersPresenterService) {}

    /**
     * This function fetches from the backend a specified amount of ids from all orga-wide stored users.
     *
     * @param start_index The index of the first id
     * @param entries The amount of ids
     *
     * @returns A list of ids from users
     */
    public async fetchAccountIds(start_index: number = 0, entries: number = 1000): Promise<Ids> {
        if (!this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
            return [];
        }
        return await this.usersPresenter.call({ start_index, entries });
    }
}
