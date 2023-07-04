import { Observable, Subscription } from 'rxjs';
import { SubscriptionMap } from 'src/app/infrastructure/utils/subscription-map';

const sub = new SubscriptionMap();

describe(`utils: subscription-map`, () => {
    describe(`delete method`, () => {
        it(`delete one subscription from two`, () => {
            let subscription: Subscription = new Observable().subscribe();
            let subscription2: Subscription = new Observable().subscribe();
            sub.updateSubscription(`test`, subscription);
            sub.updateSubscription(`test2`, subscription2);
            sub.delete(`test`);
            expect(subscription.closed).toBe(true);
            expect(subscription2.closed).toBe(false);
        });
    });

    describe(`clear method`, () => {
        it(`delete all subscriptions`, () => {
            let subscription: Subscription = new Observable().subscribe();
            let subscription2: Subscription = new Observable().subscribe();
            sub.updateSubscription(`test`, subscription);
            sub.updateSubscription(`test2`, subscription2);
            sub.clear();
            expect(subscription.closed).toBe(true);
            expect(subscription2.closed).toBe(true);
        });
    });

    describe(`updateSubscription method`, () => {
        it(`add one subscription`, () => {
            let subscription: Subscription = new Observable().subscribe();
            sub.updateSubscription(`test`, subscription);
            expect(subscription.closed).toBe(false);
            sub.clear();
            expect(subscription.closed).toBe(true);
        });
    });

    describe(`push method`, () => {
        it(`add several subscriptions`, () => {
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
});
