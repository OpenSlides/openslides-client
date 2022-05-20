import { Directive, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { combineLatest, filter, map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { SubscribeToConfig } from '../../services/model-request.service';
import { OpenSlidesRouterService } from '../../services/openslides-router.service';

export interface ModelRequestConfig extends SubscribeToConfig, HidingConfig {
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
     * If `true` a request is automatically closed when the operator is being signed out. Defaults to `true`.
     */
    hideWhenUnauthenticated?: boolean;
}

@Directive()
export class BaseModelRequestHandlerComponent extends BaseUiComponent implements OnInit, OnDestroy {
    private _destroyed = new EventEmitter<boolean>();
    private _openedSubscriptions: string[] = [];

    public constructor(
        protected modelRequestService: ModelRequestService,
        protected router: Router,
        protected openslidesRouter: OpenSlidesRouterService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.openslidesRouter.currentParamMap.subscribe(event => {
                this.onNextMeetingId(Number(event[`meetingId`] || null));
                this.onParamsChanged(event);
            })
        );
        this.initModelSubscriptions();
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this._destroyed.emit(true);
    }

    protected onBeforeModelRequests(): void | Promise<void> {}
    protected onCreateModelRequests(): ModelRequestConfig[] | void {}
    protected onNextMeetingId(id: Id | null): void {}
    protected onParamsChanged(params: any): void {}

    protected async subscribeTo(...configs: ModelRequestConfig[]): Promise<void> {
        for (const { modelRequest, subscriptionName, ...config } of configs) {
            if (!this._openedSubscriptions.includes(subscriptionName)) {
                this._openedSubscriptions.push(subscriptionName);
                const observable = this.createHideWhenObservable(config);
                await this.modelRequestService.subscribeTo({ subscriptionName, modelRequest, hideWhen: observable });
            }
        }
    }

    protected async updateSubscribeTo(...configs: ModelRequestConfig[]): Promise<void> {
        for (const config of configs) {
            const subscriptionNameIndex = this._openedSubscriptions.findIndex(name => name === config.subscriptionName);
            if (subscriptionNameIndex > -1) {
                this._openedSubscriptions.splice(subscriptionNameIndex, 1);
            }
            this.modelRequestService.closeSubscription(config.subscriptionName);
            this.subscribeTo(config);
        }
    }

    protected getNextMeetingIdObservable(): Observable<Id | null> {
        return this.router.events.pipe(
            filter(event => event instanceof RoutesRecognized),
            map((event: any) => this.getNextMeetingId(event))
        );
    }

    private async initModelSubscriptions(): Promise<void> {
        await this.onBeforeModelRequests();
        const requests = this.onCreateModelRequests();
        if (requests) {
            for (const request of requests) {
                this.setupSubscription(request);
            }
        }
    }

    private getNextMeetingId(event: RoutesRecognized): Id | null {
        const url = event.url;
        const urlSegments = url.split(`/`);
        let meetingId: Id | null = null;
        if (urlSegments.length >= 2) {
            meetingId = +urlSegments[1] || null;
        }
        return meetingId;
    }

    private async setupSubscription(request: ModelRequestConfig): Promise<void> {
        request.modelRequest.fieldset = request.modelRequest.fieldset ?? [];
        const observable = this.createHideWhenObservable(request);
        await this.modelRequestService.subscribeTo({ ...request, hideWhen: observable });
    }

    private createHideWhenObservable({
        hideWhen,
        hideWhenDestroyed,
        hideWhenUnauthenticated
    }: HidingConfig): Observable<boolean> | null {
        let observable: Observable<boolean> | null = null;
        if (hideWhen) {
            observable = hideWhen;
        } else if (hideWhenDestroyed) {
            observable = this._destroyed.asObservable();
        }
        if (hideWhenUnauthenticated) {
            if (observable) {
                const tmp = observable;
                observable = combineLatest([tmp, this.openslidesRouter.beforeSignoutObservable]).pipe(
                    map(([source1, source2]) => source1 || source2)
                );
            } else {
                observable = this.openslidesRouter.beforeSignoutObservable;
            }
        }
        return observable;
    }
}
