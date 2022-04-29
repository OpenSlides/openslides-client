import { Injectable } from '@angular/core';
import { CanLoad, Route } from '@angular/router';
import { OML } from '../../domain/definitions/organization-permission';
import { Permission } from '../../domain/definitions/permission';
import { OperatorService } from '../services/operator.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanLoad {
    public constructor(private operator: OperatorService) {}

    public async canLoad(route: Route): Promise<boolean> {
        return true;
        // await this.operator.ready;
        // const meetingPermissions: Permission[] = route.data?.['meetingPermissions'];
        // const omlPermissions: OML[] = route.data?.['omlPermissions'];
        // console.log(`canLoad`, meetingPermissions, omlPermissions);
        // if (meetingPermissions?.length) {
        //     console.log(`operator canload:`, this.operator.hasPerms(...meetingPermissions));
        //     return this.operator.hasPerms(...meetingPermissions);
        // }
        // if (omlPermissions?.length) {
        //     console.log(`operator canLoad:`, this.operator.hasOrganizationPermissions(...omlPermissions));
        //     return this.operator.hasOrganizationPermissions(...omlPermissions);
        // }
        // return true;
    }
}
