import { Directive, EventEmitter, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { SubscribeToConfig } from '../../services/model-request.service';
import { OpenSlidesRouterService } from '../../services/openslides-router.service';

export interface ModelRequestConfig extends SubscribeToConfig {
    /**
     * If `true` it fires a request after a timeout. Defaults to `true`.
     */
    isDelayed?: boolean;
}

interface HidingConfig {
    /**
     * Optionally, an observable can be passed when a request should be closed.
     */
    hideWhen?: Observable<boolean> | null;
    /**
     * If `true` a request is automatically closed when a component is going to be deleted.
     */
    hideWhenDestroyed?: boolean;
    /**
     * If `true` a request is automatically closed when the meeting got changed.
     */
    hideWhenMeetingChanged?: boolean;
    /**
     * If `true` a request is automatically closed when the operator is being signed out. Defaults to `true`.
     */
    hideWhenUnauthenticated?: boolean;
}

@Directive()
export class BaseModelRequestHandlerComponent extends BaseUiComponent implements OnInit, OnDestroy {
    private _destroyed = new EventEmitter<boolean>();
    private _openedSubscriptions: string[] = [];
    private _currentMeetingId: Id | null | undefined = undefined; //This is to ensure that the if-check in ngOnInit also fires if the application isn't in a meeting
    private _currentParams: any = {};

    protected modelRequestService: ModelRequestService;
    protected router: Router;
    protected openslidesRouter: OpenSlidesRouterService;

    public constructor() {
        super();

        this.modelRequestService = inject(ModelRequestService);
        this.router = inject(Router);
        this.openslidesRouter = inject(OpenSlidesRouterService);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.openslidesRouter.currentParamMap.subscribe(event => {
                const nextMeetingId = Number(event[`meetingId`]) || null;
                if (nextMeetingId !== this._currentMeetingId) {
                    this._currentMeetingId = nextMeetingId;
                    this.onNextMeetingId(nextMeetingId);
                }

                const eventJson = JSON.stringify(event);
                const paramsJson = JSON.stringify(this._currentParams);
                if (paramsJson !== eventJson) {
                    this.onParamsChanged(event, this._currentParams);
                    this._currentParams = event;
                }
            })
        );
        this.initModelSubscriptions();
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this._destroyed.emit(true);
    }

    protected onBeforeModelRequests(): void | Promise<void> {}
    protected onShouldCreateModelRequests(): void {}
    protected onNextMeetingId(id: Id | null): void {}
    protected onParamsChanged(params: any, oldParams?: any): void {}

    protected async subscribeTo(
        config: ModelRequestConfig | ModelRequestConfig[],
        hideWhen?: HidingConfig
    ): Promise<void> {
        if (Array.isArray(config)) {
            config.forEach(c => this.subscribeTo(c, hideWhen));
        } else {
            const { modelRequest, subscriptionName } = config;
            if (!this._openedSubscriptions.includes(subscriptionName)) {
                this._openedSubscriptions.push(subscriptionName);
                const observable = this.createHideWhenObservable(hideWhen || {}, config.hideWhen);
                await this.modelRequestService.subscribeTo({ subscriptionName, modelRequest, hideWhen: observable });
            }
        }
    }

    protected async updateSubscribeTo(
        config: ModelRequestConfig | ModelRequestConfig[],
        hideWhen?: HidingConfig
    ): Promise<void> {
        if (Array.isArray(config)) {
            config.forEach(c => this.updateSubscribeTo(c, hideWhen));
        } else {
            const subscriptionNameIndex = this._openedSubscriptions.findIndex(name => name === config.subscriptionName);
            if (subscriptionNameIndex > -1) {
                this._openedSubscriptions.splice(subscriptionNameIndex, 1);
            }
            this.modelRequestService.closeSubscription(config.subscriptionName);
            this.subscribeTo(config, hideWhen);
        }
    }

    protected hasMeetingIdChangedObservable(): Observable<boolean> {
        return this.openslidesRouter.meetingIdChanged.pipe(map(event => event.hasChanged));
    }

    protected getNextMeetingIdObservable(): Observable<Id | null> {
        return this.openslidesRouter.meetingIdChanged.pipe(map(event => event.nextMeetingId));
    }

    private async initModelSubscriptions(): Promise<void> {
        await this.onBeforeModelRequests();
        this.onShouldCreateModelRequests();
    }

    private createHideWhenObservable(
        { hideWhen, hideWhenDestroyed, hideWhenMeetingChanged, hideWhenUnauthenticated }: HidingConfig,
        ...additional: Observable<boolean>[]
    ): Observable<boolean> | null {
        let observables: Observable<boolean>[] = [];

        additional = additional.filter(e => !!e);
        if (additional && additional.length) {
            observables.push(...additional);
        }

        if (hideWhen) {
            observables.push(hideWhen);
        }

        if (hideWhenDestroyed === true) {
            observables.push(this._destroyed.asObservable().pipe(startWith(false)));
        }

        if (hideWhenMeetingChanged) {
            observables.push(this.hasMeetingIdChangedObservable().pipe(startWith(false)));
        }

        if (hideWhenUnauthenticated) {
            observables.push(this.openslidesRouter.beforeSignoutObservable.pipe(startWith(false)));
        }

        if (observables.length >= 2) {
            return combineLatest(observables).pipe(map(values => values.some(source => source)));
        } else if (observables.length === 1) {
            return observables[0];
        }

        return null;
    }
}
