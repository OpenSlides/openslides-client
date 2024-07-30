import { Directive, Input, TemplateRef } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';

import { BasePermsDirective } from './base-perms.directive';

@Directive({
    selector: `[osCmlPerms]`
})
export class CmlPermsDirective extends BasePermsDirective<CML> {
    @Input()
    public set osCmlPerms(perms: CML | CML[]) {
        this.setPermissions(perms);
    }

    @Input()
    public set osCmlPermsCommitteeId(id: Id | undefined) {
        this._committeeId = id;
        this.updatePermission();
    }

    @Input()
    public set osCmlPermsAnd(value: boolean) {
        this.setAndCondition(value);
    }

    @Input()
    public set osCmlPermsOr(value: boolean) {
        this.setOrCondition(value);
    }

    @Input()
    public set osCmlPermsComplement(value: boolean) {
        this.setComplementCondition(value);
    }

    @Input()
    public set osCmlPermsNonAdminCheck(value: boolean) {
        this._checkNonAdmin = value;
        this.updatePermission();
    }

    @Input()
    public set osCmlPermsThen(template: TemplateRef<any>) {
        this.setThenTemplate(template);
    }

    @Input()
    public set osCmlPermsElse(template: TemplateRef<any>) {
        this.setElseTemplate(template);
    }

    @Input()
    public set osCmlPermsOrOML(value: OML | undefined) {
        this._orOML = value;
        this.updatePermission();
    }

    private _committeeId: Id | undefined = undefined;
    private _checkNonAdmin = false;
    private _orOML: OML | undefined = undefined;

    protected hasPermissions(): boolean {
        if (this._orOML && this.operator.hasOrganizationPermissions(this._orOML)) {
            return true;
        }
        if (!this._committeeId) {
            return false;
        }
        if (this._checkNonAdmin) {
            return this.operator.hasCommitteePermissionsNonAdminCheck(this._committeeId, ...this.permissions);
        } else {
            return this.operator.hasCommitteePermissions(this._committeeId, ...this.permissions);
        }
    }
}
