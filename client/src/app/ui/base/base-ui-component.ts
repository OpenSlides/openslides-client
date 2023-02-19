import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { SubscriptionMap } from 'src/app/infrastructure/utils/subscription-map';

@Directive()
export class BaseUiComponent implements OnDestroy {
    protected subscriptions = new SubscriptionMap();

    public updateSubscription(name: string, subscription: Subscription): void {
        this.clearSubscription(name);
        this.subscriptions.updateSubscription(name, subscription);
    }

    private clearSubscription(name: string): void {
        this.subscriptions.delete(name);
    }

    /**
     * automatically clears subscriptions if the component is destroyed.
     */
    public ngOnDestroy(): void {
        this.cleanSubscriptions();
    }

    /**
     * Manually clears all stored subscriptions.
     * Necessary for manual routing control, since the Angular
     * life cycle does not accept that navigation to the same URL
     * executes the life cycle again
     */
    protected cleanSubscriptions(): void {
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
}
