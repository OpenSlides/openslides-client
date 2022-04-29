import {
    ChangeDetectorRef,
    Pipe,
    PipeTransform,
    OnDestroy,
    EventEmitter,
    ɵisPromise,
    ɵisSubscribable
} from '@angular/core';
import { Observable, Subscribable, Unsubscribable } from 'rxjs';

///////
/////// This whole implementation is just copied from https://github.com/angular/angular/blob/master/packages/common/src/pipes/async_pipe.ts
///////

interface SubscriptionStrategy {
    createSubscription(async: Subscribable<any> | Promise<any>, updateLatestValue: any): Unsubscribable | Promise<any>;
    dispose(subscription: Unsubscribable | Promise<any>): void;
    onDestroy(subscription: Unsubscribable | Promise<any>): void;
}

class SubscribableStrategy implements SubscriptionStrategy {
    createSubscription(async: Subscribable<any>, updateLatestValue: any): Unsubscribable {
        return async.subscribe({
            next: updateLatestValue,
            error: (e: any) => {
                throw e;
            }
        });
    }

    dispose(subscription: Unsubscribable): void {
        subscription.unsubscribe();
    }

    onDestroy(subscription: Unsubscribable): void {
        subscription.unsubscribe();
    }
}

class PromiseStrategy implements SubscriptionStrategy {
    createSubscription(async: Promise<any>, updateLatestValue: (v: any) => any): Promise<any> {
        return async.then(updateLatestValue, e => {
            throw e;
        });
    }

    dispose(subscription: Promise<any>): void {}

    onDestroy(subscription: Promise<any>): void {}
}

const _promiseStrategy = new PromiseStrategy();
const _subscribableStrategy = new SubscribableStrategy();

/**
 * Overrides the Angular's async pipe because this returns `T | null` and leads to errors in an html-template.
 */
@Pipe({ name: 'async', pure: false })
export class OpenSlidesAsyncPipe implements PipeTransform, OnDestroy {
    private _latestValue: any = null;

    private _subscription: Unsubscribable | Promise<any> | null = null;
    private _obj: Subscribable<any> | Promise<any> | EventEmitter<any> | null = null;
    private _strategy: SubscriptionStrategy = null!;

    public constructor(private _ref: ChangeDetectorRef) {}

    public ngOnDestroy(): void {
        if (this._subscription) {
            this._dispose();
        }
    }

    public transform<T>(obj: Observable<T> | Subscribable<T> | Promise<T>): T;
    public transform<T>(obj: Observable<T> | Subscribable<T> | Promise<T> | null | undefined): T;
    public transform<T>(obj: Observable<T> | Subscribable<T> | Promise<T> | null | undefined): T {
        if (!this._obj) {
            if (obj) {
                this._subscribe(obj);
            }
            return this._latestValue;
        }

        if (obj !== this._obj) {
            this._dispose();
            return this.transform(obj);
        }

        return this._latestValue;
    }

    private _subscribe(obj: Subscribable<any> | Promise<any> | EventEmitter<any>): void {
        this._obj = obj;
        this._strategy = this._selectStrategy(obj);
        this._subscription = this._strategy.createSubscription(obj, (value: Object) =>
            this._updateLatestValue(obj, value)
        );
    }

    private _selectStrategy(obj: Subscribable<any> | Promise<any> | EventEmitter<any>): any {
        if (ɵisPromise(obj)) {
            return _promiseStrategy;
        }

        if (ɵisSubscribable(obj)) {
            return _subscribableStrategy;
        }

        throw new Error(`Invalid argument for OpenSlidesAsyncPipe`);
    }

    private _dispose(): void {
        this._strategy.dispose(this._subscription!);
        this._latestValue = null;
        this._subscription = null;
        this._obj = null;
    }

    private _updateLatestValue(async: any, value: Object): void {
        if (async === this._obj) {
            this._latestValue = value;
            this._ref.markForCheck();
        }
    }
}
