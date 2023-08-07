import { Observable, Subscription } from 'rxjs';
import { SubscriptionMap } from 'src/app/infrastructure/utils/subscription-map';

describe(`utils: subscription-map`, () => {
    let sub: SubscriptionMap;
    beforeEach(() => {
        sub = new SubscriptionMap();
    });
    it(`delete method: delete one subscription from two`, () => {
        let subscription: Subscription = new Observable().subscribe();
        let subscription2: Subscription = new Observable().subscribe();
        sub.updateSubscription(`test`, subscription);
        sub.updateSubscription(`test2`, subscription2);
        sub.delete(`test`);
        expect(subscription.closed).toBe(true);
        expect(subscription2.closed).toBe(false);
    });

    it(`clear method: delete all subscriptions`, () => {
        let subscription: Subscription = new Observable().subscribe();
        let subscription2: Subscription = new Observable().subscribe();
        sub.updateSubscription(`test`, subscription);
        sub.updateSubscription(`test2`, subscription2);
        sub.clear();
        expect(subscription.closed).toBe(true);
        expect(subscription2.closed).toBe(true);
    });

    it(`updateSubscription method: add one subscription`, () => {
        let subscription: Subscription = new Observable().subscribe();
        sub.updateSubscription(`test`, subscription);
        expect(subscription.closed).toBe(false);
        sub.clear();
        expect(subscription.closed).toBe(true);
    });

    it(`push method: add several subscriptions`, () => {
        let subscription: Subscription = new Observable().subscribe();
        let subscription2: Subscription = new Observable().subscribe();
        sub.push(subscription2, subscription);
        expect(subscription.closed).toBe(false);
        expect(subscription2.closed).toBe(false);
        sub.clear();
        expect(subscription.closed).toBe(true);
        expect(subscription2.closed).toBe(true);
    });
});
