import { Directive, Input } from '@angular/core';

import { CML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { BasePermsDirective } from './base-perms.directive';

@Directive({
    selector: '[osCmlPerms]'
})
export class CmlPermsDirective extends BasePermsDirective<CML> {
    @Input()
    public set osCmlPerms(perms: CML | CML[]) {
        this.setPermissions(perms);
    }

    @Input()
    public set osCmlPermsCommitteeId(id: Id) {
        this.committeeId = id;
        this.updateView();
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

    private committeeId: Id | undefined = undefined;

    protected hasPermissions(): boolean {
        return this.operator.hasCommitteePermissions(this.committeeId, ...this.permissions);
    }
}
