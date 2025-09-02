import { Directive, Input, TemplateRef } from '@angular/core';
import { OML } from 'src/app/domain/definitions/organization-permission';

import { BasePermsDirective } from './base-perms.directive';

@Directive({
    selector: `[osOmlPerms]`,
    standalone: false
})
export class OmlPermsDirective extends BasePermsDirective<OML> {
    private _checkCML = false;

    @Input()
    public set osOmlPerms(perms: OML | OML[]) {
        this.setPermissions(perms);
    }

    @Input()
    public set osOmlPermsAnd(value: boolean) {
        this.setAndCondition(value);
    }

    @Input()
    public set osOmlPermsOr(value: boolean) {
        this.setOrCondition(value);
    }

    @Input()
    public set osOmlPermsComplement(value: boolean) {
        this.setComplementCondition(value);
    }

    /**
     * If set to true in order to also allow anyone who has any committee permissions
     * `*osPerms="permission.mediafileCanManage; allowCommitteeAdmin: true"`
     */
    @Input()
    public set osOmlPermsAllowCommitteeAdmin(value: boolean) {
        this._checkCML = value;
        this.updatePermission();
    }

    @Input()
    public set osOmlPermsThen(template: TemplateRef<any>) {
        this.setThenTemplate(template);
    }

    @Input()
    public set osOmlPermsElse(template: TemplateRef<any>) {
        this.setElseTemplate(template);
    }

    protected hasPermissions(): boolean {
        return (
            this.operator.hasOrganizationPermissions(...this.permissions) ||
            (this._checkCML ? this.operator.isAnyCommitteeManager : false)
        );
    }
}
