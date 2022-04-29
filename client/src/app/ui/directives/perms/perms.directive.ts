import { Directive, Input } from '@angular/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { BasePermsDirective } from './base-perms.directive';

@Directive({
    selector: '[osPerms]'
})
export class PermsDirective extends BasePermsDirective<Permission> {
    /**
     * The value defines the requires permissions as an array or a single permission.
     */
    @Input()
    public set osPerms(value: Permission | Permission[] | undefined) {
        if (value) {
            this.setPermissions(value);
        }
    }

    /**
     * `*osPerms="...; or:..."` turns into osPermsOr during runtime.
     */
    @Input()
    public set osPermsOr(value: boolean) {
        this.setOrCondition(value);
    }

    /**
     * `*osPerms="...; complement:..."` turns into osPermsComplement during runtime.
     */
    @Input()
    public set osPermsComplement(value: boolean) {
        this.setComplementCondition(value);
    }

    /**
     * `*osPerms="...; and:..."` turns into osPermsAnd during runtime.
     */
    @Input()
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
