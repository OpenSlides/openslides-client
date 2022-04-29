import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SubscriptionMap } from 'src/app/infrastructure/utils/subscription-map';

@Directive()
export class BaseUiComponent implements OnDestroy {
    protected subscriptions = new SubscriptionMap();

    public updateSubscription(name: string, subscription: Subscription): void {
        this.subscriptions.updateSubscription(name, subscription);
    }

    public ngOnDestroy(): void {
        this.subscriptions.clear();
    }

    public raiseWarning(message: string): void {}

    public raiseError(message: string): void {}

    public closeSnackbar(): void {}

    /**
     * Helper for indexed *ngFor components
     *
     * @param index
     */
    public trackByIndex(index: number): number {
        return index;
    }
}
