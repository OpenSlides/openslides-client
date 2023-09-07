import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ContentChild, EventEmitter, Input, OnDestroy, Output, TemplateRef } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom, Observable, Subscription } from 'rxjs';
import { Selectable } from 'src/app/domain/interfaces/selectable';

@Component({
    selector: `os-sorting-list`,
    templateUrl: `./sorting-list.component.html`,
    styleUrls: [`./sorting-list.component.scss`]
})
export class SortingListComponent<T extends Selectable = Selectable> implements OnDestroy {
    /**
     * Sorted and returned
     */
    public sortedItems: T[] = [];

    /**
     * The index of multiple selected elements. Allows for multiple items to be
     * selected and then moved
     */
    public multiSelectedIndex: number[] = [];

    /**
     * Declare the templateRef to coexist between parent in child
     */
    @ContentChild(TemplateRef, { static: true })
    public templateRef: TemplateRef<T>;

    /**
     * Set to true if events are directly fired after sorting.
     * usually combined with sortEvent.
     * Prevents the `@input` from resetting the sorting
     *
     * @example
     * ```html
     *  <os-sorting-list ... [live]="true" (sortEvent)="onSortingChange($event)">
     * ```
     */
    @Input()
    public live = false;

    /** Determine whether to put an index number in front of the list */
    @Input()
    public count = false;

    /**
     * Can be set to false to disable drag n drop
     */
    @Input()
    public enable = true;

    /**
     * The time before dragging starts
     */
    @Input()
    public dragDelay = 0;

    /**
     * The Input List Values
     *
     * If live updates are enabled, new values are always converted into the sorting array.
     *
     * If live updates are disabled, new values are processed when the auto update adds
     * or removes relevant objects
     *
     * One can pass the values as an array or an observalbe. If the observable is chosen,
     * every time the observable changes, the array is updated with the rules above.
     */
    @Input()
    public set input(newValues: T[] | Observable<T[]>) {
        if (newValues) {
            if (this.inputSubscription) {
                this.inputSubscription.unsubscribe();
            }
            if (newValues instanceof Observable) {
                this.inputSubscription = newValues.subscribe(values => {
                    this.updateArray(values);
                });
            } else {
                this.inputSubscription = null;
                this.updateArray(newValues);
            }
        }
    }

    /**
     * Saves the subscription, if observables are used. Cleared in the onDestroy hook.
     */
    private inputSubscription: Subscription | null = null;

    /**
     * Always stores the current items from the last update. Needed for restore and changing between live=true/false
     */
    private currentItems: T[] = [];

    private draggingFinished = new BehaviorSubject<boolean>(true);
    private sortingChangedFrom: T[];

    /**
     * Inform the parent view about sorting.
     * Alternative approach to submit a new order of elements
     */
    @Output()
    public sortEvent = new EventEmitter<T[]>();

    /**
     * Unsubscribe every subscription.
     */
    public ngOnDestroy(): void {
        if (this.inputSubscription) {
            this.inputSubscription.unsubscribe();
        }
    }

    /**
     * Updates the array with the new data. This is called if the input changes.
     *
     * @param newValues The new values to set.
     */
    private async updateArray(newValues: T[]): Promise<void> {
        // const oldItems = this.currentItems;
        this.currentItems = newValues.map(val => val);
        if (!this.draggingFinished.value) {
            this.sortingChangedFrom = this.sortedItems;
            await firstValueFrom(this.draggingFinished.pipe(filter(finished => finished)));
            newValues = [...this.currentItems];
        }
        this.updateSortedList(newValues);
    }

    private updateSortedList(newValues: T[]): void {
        const set = new Set(this.sortedItems.map(item => item.id));
        if (this.live || this.sortedItems.length !== newValues.length || newValues.some(value => !set.has(value.id))) {
            this.sortedItems = newValues.map(val => val);
        } else {
            this.sortedItems = this.sortedItems.map(arrayValue =>
                newValues.find(val => val.id === arrayValue.id)
            ) as T[];
        }
    }

    /**
     * Restore the old order from the last update
     */
    public async restore(): Promise<void> {
        if (!this.draggingFinished.value) {
            await firstValueFrom(this.draggingFinished.pipe(filter(finished => finished)));
        }
        this.sortedItems = this.currentItems.map(val => val);
    }

    /**
     * Handles the start of a dragDrop event and clears multiSelect if the dragged item
     * is not part of the selected items
     */
    public dragStarted(index: number): void {
        this.draggingFinished.next(false);
        if (this.multiSelectedIndex.length && !this.multiSelectedIndex.includes(index)) {
            this.multiSelectedIndex = [];
        }
    }

    /**
     * drop event
     * @param event the event
     * @param dropBehind (optional) toggle explicit 'insert behind' (true) or
     * 'insert before' (false) behavior instead of relying on a
     * 'natural drop logic'
     */
    public drop(event: CdkDragDrop<T[]> | { currentIndex: number; previousIndex: number }, dropBehind?: boolean): void {
        let multiSelectedIndex = this.multiSelectedIndex;
        if (this.sortingChangedFrom) {
            ({ event, multiSelectedIndex } = this.calculateNewDropIndices(event, multiSelectedIndex));
            this.updateSortedList([...this.currentItems]);
            this.sortingChangedFrom = undefined;
        }
        if (event.previousIndex !== undefined) {
            if (!multiSelectedIndex.length) {
                moveItemInArray(this.sortedItems, event.previousIndex, event.currentIndex);
            } else {
                this.moveMultipleItemsInArray(event, multiSelectedIndex, dropBehind);
            }
            this.sortEvent.emit(this.sortedItems);
            this.multiSelectedIndex = [];
        }
        this.draggingFinished.next(true);
    }

    /**
     * Handles a click on a row. If the control key is clicked, the element is
     * added/removed from a multiselect list /(which will be handled on
     * dropping)
     *
     * @param event MouseEvent.
     * @param indx The index of the row clicked.
     */
    public onItemClick(event: MouseEvent, indx: number): void {
        if (event.ctrlKey) {
            const ind = this.multiSelectedIndex.findIndex(i => i === indx);
            if (ind === -1) {
                this.multiSelectedIndex.push(indx);
            } else {
                this.multiSelectedIndex = this.multiSelectedIndex
                    .slice(0, ind)
                    .concat(this.multiSelectedIndex.slice(ind + 1));
            }
        } else {
            // deselect all when clicking on an non-selected item
            if (this.multiSelectedIndex.length && !this.multiSelectedIndex.includes(indx)) {
                this.multiSelectedIndex = [];
            }
        }
    }

    /**
     * Checks if the row at the given index is currently selected
     *
     * @param index
     * @returns true if the item is currently selected
     */
    public isSelectedRow(index: number): boolean {
        return this.multiSelectedIndex.includes(index);
    }

    private calculateNewDropIndices(
        event: CdkDragDrop<T[]> | { currentIndex: number; previousIndex: number },
        multiSelectedIndex: number[]
    ): { event: CdkDragDrop<T[]> | { currentIndex: number; previousIndex: number }; multiSelectedIndex: number[] } {
        if (this.sortingChangedFrom) {
            let newPreviousIndex = this.currentItems.findIndex(
                item => item.id === this.sortingChangedFrom[event.previousIndex].id
            );
            const newMultiSelectedIndex = multiSelectedIndex
                .map(index => this.currentItems.findIndex(item => item.id === this.sortingChangedFrom[index].id))
                .filter(index => index !== -1)
                .sort();
            const newCurrentIndex = Math.min(event.currentIndex, this.currentItems.length - 1);
            if (newPreviousIndex === -1) {
                newPreviousIndex = newMultiSelectedIndex.length ? newMultiSelectedIndex[0] : undefined;
            }
            return {
                event: { currentIndex: newCurrentIndex, previousIndex: newPreviousIndex },
                multiSelectedIndex: newMultiSelectedIndex
            };
        }
        return { event, multiSelectedIndex };
    }

    private moveMultipleItemsInArray(
        event: CdkDragDrop<T[]> | { currentIndex: number; previousIndex: number },
        multiSelectedIndex: number[],
        dropBehind?: boolean
    ): void {
        const before: T[] = [];
        const insertions: T[] = [];
        const behind: T[] = [];
        // TODO: this must be refactored!
        for (let i = 0; i < this.sortedItems.length; i++) {
            if (!multiSelectedIndex.includes(i)) {
                if (i < event.currentIndex) {
                    before.push(this.sortedItems[i]);
                } else if (i > event.currentIndex) {
                    behind.push(this.sortedItems[i]);
                } else {
                    if (dropBehind === false) {
                        behind.push(this.sortedItems[i]);
                    } else if (dropBehind === true) {
                        before.push(this.sortedItems[i]);
                    } else {
                        if (Math.min(...multiSelectedIndex) < i) {
                            before.push(this.sortedItems[i]);
                        } else {
                            behind.push(this.sortedItems[i]);
                        }
                    }
                }
            } else {
                insertions.push(this.sortedItems[i]);
            }
        }
        this.sortedItems = [...before, ...insertions, ...behind];
    }
}
