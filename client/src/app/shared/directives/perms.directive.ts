import { Directive, Input } from '@angular/core';

import { Permission } from 'app/core/core-services/permission';
import { BasePermsDirective } from './base-perms.directive';

/**
 * Directive to check if the {@link OperatorService} has the correct permissions to access certain functions
 *
 * @example <div *osPerms="'perm'" ..> ... < /div>
 * @example <div *osPerms="['perm1', 'perm2']" ..> ... < /div>
 */
@Directive({
    selector: '[osPerms]'
})
export class PermsDirective extends BasePermsDirective<Permission> {
    /**
     * The value defines the requires permissions as an array or a single permission.
     */
    @Input()
    public set osPerms(value: Permission | Permission[]) {
        this.setPermissions(value);
    }

    /**
     * `*osPerms="...; or:..."` turns into osPermsOr during runtime.
     */
    @Input('osPermsOr')
    public set osPermsAlt(value: boolean) {
        this.setOrCondition(value);
    }

    /**
     * `*osPerms="...; complement:..."` turns into osPermsComplement during runtime.
     */
    @Input('osPermsComplement')
    public set osPermsComplement(value: boolean) {
        this.setComplementCondition(value);
    }

    /**
     * `*osPerms="...; and:..."` turns into osPermsAnd during runtime.
     */
    @Input('osPermsAnd')
    public set osPermsAnd(value: boolean) {
        this.setAndCondition(value);
    }

    /**
     * Compare the required permissions with the users permissions.
     * Returns true if the users permissions fit.
     */
    protected hasPermissions(): boolean {
        return this.operator.hasPerms(...this.permissions);
    }
}
