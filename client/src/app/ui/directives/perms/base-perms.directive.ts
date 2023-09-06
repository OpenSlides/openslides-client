import { Directive, EmbeddedViewRef, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { OperatorService } from 'src/app/site/services/operator.service';

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
    private _lastPermissionCheckResult: boolean | null = null; // take null to also catch a first "false" update

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
    private _alternative = false;

    /**
     * Switch, to invert the result of checkPermission. Usefull for using osPerms as if-else:
     * For one element you can use `*osPerms="'perm'"` and for the else-element use
     * `*osPerms="'perm';complement: true"`.
     */
    private _complement = false;

    /**
     * Add a true-false-condition additional to osPerms
     * `*osPerms="permission.mediafileCanManage; and: !isMultiSelect"`
     */
    private _and = true;

    private _thenTemplate: TemplateRef<unknown>;
    private _thenViewRef: EmbeddedViewRef<unknown> | null = null;
    private _elseTemplate: TemplateRef<unknown> | null = null;
    private _elseViewRef: EmbeddedViewRef<unknown> | null = null;

    private _operatorSubscription: Subscription | null = null;

    private _hasPerms = false;

    /**
     * Constructs the directive once. Observes the operator for it's groups so the
     * directive can perform changes dynamically
     *
     * @param template inner part of the HTML container
     * @param viewContainer outer part of the HTML container (for example a `<div>`)
     */
    public constructor(
        template: TemplateRef<any>,
        protected viewContainer: ViewContainerRef,
        protected operator: OperatorService
    ) {
        this._thenTemplate = template;
    }

    public ngOnInit(): void {
        // observe groups of operator, so the directive can actively react to changes
        this._operatorSubscription = this.operator.operatorUpdated.subscribe(() => {
            this.updatePermission();
        });
    }

    public ngOnDestroy(): void {
        if (this._operatorSubscription) {
            this._operatorSubscription.unsubscribe();
            this._operatorSubscription = null;
        }
    }

    protected setPermissions(value: P | P[]): void {
        if (!value) {
            value = [];
        } else if (!Array.isArray(value)) {
            value = [value];
        }
        this.permissions = value;
        this.updatePermission();
    }

    protected setOrCondition(value: boolean): void {
        this._alternative = value;
        this.updatePermission();
    }

    protected setComplementCondition(value: boolean): void {
        this._complement = value;
        this.updatePermission();
    }

    protected setAndCondition(value: boolean): void {
        this._and = value;
        this.updatePermission();
    }

    protected setThenTemplate(template: TemplateRef<unknown>): void {
        if (template) {
            this._thenTemplate = template;
            this.updateView(true);
        }
    }

    protected setElseTemplate(template: TemplateRef<unknown>): void {
        if (template) {
            this._elseTemplate = template;
            this.updateView(true);
        }
    }

    /**
     * Triggers to check, if the operator has still the required permissions.
     */
    protected updatePermission(): void {
        this._hasPerms = this._hasPermissions() || this._alternative;
        const permsChanged = this._hasPerms !== this._lastPermissionCheckResult;
        if (permsChanged) {
            this.updateView();
        }
        this._lastPermissionCheckResult = this._hasPerms;
    }

    /**
     * This clears the parent container's content and adds optionally a template as next content.
     *
     * @param forceUpdate Whether the view should be updated in any case. This is necessary, if the templates changed
     * but a view was already initiated.
     */
    private updateView(forceUpdate = false): void {
        if (this._hasPerms && (!this._thenViewRef || forceUpdate)) {
            // clean up and add the template,
            this.viewContainer.clear();
            this._elseViewRef = null;
            this.initThenView();
        } else if (!this._hasPerms && (!this._elseViewRef || forceUpdate)) {
            // will remove the content of the container
            this.viewContainer.clear();
            this._thenViewRef = null;
            this.initElseView();
        }
    }

    private initThenView(): void {
        if (this._thenTemplate) {
            this._thenViewRef = this.viewContainer.createEmbeddedView(this._thenTemplate);
        }
    }

    private initElseView(): void {
        if (this._elseTemplate) {
            this._elseViewRef = this.viewContainer.createEmbeddedView(this._elseTemplate);
        }
    }

    private _hasPermissions(): boolean {
        const hasPerms = this._and ? !this.permissions.length || this.hasPermissions() : false;

        if (this._complement) {
            return !hasPerms;
        } else {
            return hasPerms;
        }
    }

    protected abstract hasPermissions(): boolean;
}
