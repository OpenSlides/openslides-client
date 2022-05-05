import { Subscription } from 'rxjs';

export class SubscriptionMap {
    private _subscriptions: { [key: string]: Subscription } = {};

    public updateSubscription(name: string, subscription: Subscription): void {
        if (this._subscriptions[name]) {
            this._subscriptions[name].unsubscribe();
            delete this._subscriptions[name];
        }
        this._subscriptions[name] = subscription;
    }

    public push(...subscriptions: Subscription[]): void {
        for (const subscription of subscriptions) {
            this.updateSubscription(this.nextRandomId(), subscription);
        }
    }

    public delete(subscriptionName: string): void {
        if (this._subscriptions[subscriptionName]) {
            this._subscriptions[subscriptionName].unsubscribe();
            delete this._subscriptions[subscriptionName];
        }
    }

    public clear(): void {
        for (const subscription of Object.values(this._subscriptions)) {
            subscription.unsubscribe();
        }
        this._subscriptions = {};
    }

    private nextRandomId(): string {
        const id = Math.floor(Math.random() * (900000 - 1) + 100000);
        return id.toString();
    }
}
