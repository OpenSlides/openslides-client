import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
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

    /**
     * Helper for indexed *ngFor components
     *
     * @param index
     */
    public trackByIndex(index: number): number {
        return index;
    }

    /**
     * Helper for *ngFor => tracked items by their corresponding id.
     */
    public trackById(_index: number, item: Id | Identifiable): Id {
        return typeof item === `number` ? item : item.id;
    }

    protected closeSnackbar = (): void => {};
    protected raiseError = (message: string): void => {};
    protected raiseWarning = (message: string): void => {};
}
