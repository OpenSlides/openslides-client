import { Directive, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, map, Observable, tap } from 'rxjs';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { SubscribeToConfig } from '../../services/model-request.service';
import { OpenSlidesRouterService } from '../../services/openslides-router.service';

export interface ModelRequestConfig extends SubscribeToConfig {
    hideWhenDestroyed?: boolean;
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
        for (const { modelRequest, subscriptionName, hideWhen, hideWhenDestroyed } of configs) {
            if (!this._openedSubscriptions.includes(subscriptionName)) {
                this._openedSubscriptions.push(subscriptionName);
                const observable = this.createHideWhenObservable(hideWhen, hideWhenDestroyed);
                await this.modelRequestService.subscribeTo({ subscriptionName, modelRequest, hideWhen: observable });
            }
        }
    }

    protected async updateSubscribeTo(config: ModelRequestConfig): Promise<void> {
        const subscriptionNameIndex = this._openedSubscriptions.findIndex(name => name === config.subscriptionName);
        if (subscriptionNameIndex > -1) {
            this._openedSubscriptions.splice(subscriptionNameIndex, 1);
        }
        this.modelRequestService.closeSubscription(config.subscriptionName);
        this.subscribeTo(config);
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
        const observable = this.createHideWhenObservable(request.hideWhen, request.hideWhenDestroyed);
        await this.modelRequestService.subscribeTo({ ...request, hideWhen: observable });
    }

    private createHideWhenObservable(
        hideWhen?: Observable<boolean> | null,
        hideWhenDestroyed?: boolean
    ): Observable<boolean> | null {
        if (hideWhen) {
            return hideWhen;
        } else if (hideWhenDestroyed) {
            return this._destroyed.asObservable();
        } else {
            return null;
        }
    }
}
