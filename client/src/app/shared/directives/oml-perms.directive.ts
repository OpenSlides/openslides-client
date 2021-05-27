import { Directive, Input } from '@angular/core';

import { OML } from 'app/core/core-services/organization-permission';
import { BasePermsDirective } from './base-perms.directive';

@Directive({
    selector: '[osOmlPerms]'
})
export class OmlPermsDirective extends BasePermsDirective<OML> {
    @Input()
    public set osOmlPerms(perms: OML | OML[]) {
        this.setPermissions(perms);
    }

    @Input('osOmlPermsAnd')
    public set osOmlPermsAnd(value: boolean) {
        this.setAndCondition(value);
    }

    @Input('osOmlPermsOr')
    public set osOmlPermsOr(value: boolean) {
        this.setOrCondition(value);
    }

    @Input('osOmlPermsComplement')
    public set osOmlPermsComplement(value: boolean) {
        this.setComplementCondition(value);
    }

    protected hasPermissions(): boolean {
        return this.operator.hasOrganizationPermissions(...this.permissions);
    }
}
