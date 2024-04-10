import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DelegationSetting } from 'src/app/domain/definitions/delegation-setting';
import { Permission } from 'src/app/domain/definitions/permission';

import { BasePermsDirective } from './base-perms.directive';

@Directive({
    selector: `[osPerms]`
})
export class PermsDirective extends BasePermsDirective<Permission> implements OnInit, OnDestroy {
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
     * `*osPerms="...; delegationSettingAlternative:..."` turns into osPermsDelegationSettingAlternative during runtime.
     */
    @Input()
    public set osPermsDelegationSettingAlternative(delegationSettingAlternative: [DelegationSetting, Permission]) {
        this._delegationSettingAlternative = delegationSettingAlternative;
        this.updatePermission();
    }

    /**
     * `*osPerms="...; and:..."` turns into osPermsAnd during runtime.
     */
    @Input()
    public set osPermsAnd(value: boolean) {
        this.setAndCondition(value);
    }

    private _delegationSettingAlternative: [DelegationSetting, Permission] = null;
    private _delegationSettingSubscription: Subscription;

    public override ngOnInit(): void {
        // observe groups of operator, so the directive can actively react to changes
        this._delegationSettingSubscription = this.operator.delegationSettingsUpdated.subscribe(() => {
            this.updatePermission();
        });
        super.ngOnInit();
    }

    public override ngOnDestroy(): void {
        if (this._delegationSettingSubscription) {
            this._delegationSettingSubscription.unsubscribe();
            this._delegationSettingSubscription = null;
        }
        super.ngOnDestroy();
    }

    /**
     * Compare the required permissions with the users permissions.
     * Returns true if the users permissions fit.
     */
    protected hasPermissions(): boolean {
        let permissions = this.permissions;
        if (
            this._delegationSettingAlternative &&
            !this.operator.isAllowedWithDelegation(this._delegationSettingAlternative[0])
        ) {
            permissions = [this._delegationSettingAlternative[1]];
        }
        return this.operator.hasPerms(...permissions);
    }
}
