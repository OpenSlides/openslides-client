import { Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

import { Subscription } from 'rxjs';

import { OperatorService } from 'app/core/core-services/operator.service';

@Directive()
export abstract class BasePermsDirective<P> implements OnInit, OnDestroy {
    /**
     * Holds required permissions to access a feature
     */
    protected permissions: P[] = [];

    /**
     * Holds the value of the last permission check. Therefore one can check, if the
     * permission has changes, to save unnecessary view updates, if not.
     */
    private lastPermissionCheckResult: boolean | null = null; // take null to also catch a first "false" update

    /**
     * Alternative to the permissions. Used in special case where a combination
     * with *ngIf would be required.
     *
     * # Example:
     *
     * The div will render if the permission `user.can_manage` is set
     * or if `this.ownPage` is `true`
     * ```html
     * <div *osPerms="'users.can_manage';or:ownPage"> something </div>
     * ```
     */
    private alternative: boolean;

    /**
     * Switch, to invert the result of checkPermission. Usefull for using osPerms as if-else:
     * For one element you can use `*osPerms="'perm'"` and for the else-element use
     * `*osPerms="'perm';complement: true"`.
     */
    private complement: boolean;

    /**
     * Add a true-false-condition additional to osPerms
     * `*osPerms="permission.mediafilesCanManage; and: !isMultiSelect"`
     */
    private and = true;

    private operatorSubscription: Subscription | null = null;

    /**
     * Constructs the directive once. Observes the operator for it's groups so the
     * directive can perform changes dynamically
     *
     * @param template inner part of the HTML container
     * @param viewContainer outer part of the HTML container (for example a `<div>`)
     * @param operator OperatorService
     */
    public constructor(
        protected template: TemplateRef<any>,
        protected viewContainer: ViewContainerRef,
        protected operator: OperatorService
    ) {}

    public ngOnInit(): void {
        // observe groups of operator, so the directive can actively react to changes
        this.operatorSubscription = this.operator.operatorUpdatedEvent.subscribe(() => {
            this.updateView();
        });
    }

    public ngOnDestroy(): void {
        if (this.operatorSubscription) {
            this.operatorSubscription.unsubscribe();
            this.operatorSubscription = null;
        }
    }

    protected setPermissions(value: P | P[]): void {
        if (!value) {
            value = [];
        } else if (!Array.isArray(value)) {
            value = [value];
        }
        this.permissions = value;
        this.updateView();
    }

    protected setOrCondition(value: boolean): void {
        this.alternative = value;
        this.updateView();
    }

    protected setComplementCondition(value: boolean): void {
        this.complement = value;
        this.updateView();
    }

    protected setAndCondition(value: boolean): void {
        this.and = value;
        this.updateView();
    }

    /**
     * Triggers to check, if the operator has still the required permissions.
     */
    protected updateView(): void {
        const hasPerms = this._hasPermissions();
        const permsChanged = hasPerms !== this.lastPermissionCheckResult;

        if ((hasPerms && permsChanged) || this.alternative) {
            // clean up and add the template
            this.viewContainer.clear();
            this.viewContainer.createEmbeddedView(this.template);
        } else if (!hasPerms) {
            // will remove the content of the container
            this.viewContainer.clear();
        }
        this.lastPermissionCheckResult = hasPerms;
    }

    protected abstract hasPermissions(): boolean;

    private _hasPermissions(): boolean {
        const hasPerms = this.and ? !this.permissions.length || this.hasPermissions() : false;

        if (this.complement) {
            return !hasPerms;
        } else {
            return hasPerms;
        }
    }
}
