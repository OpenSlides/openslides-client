import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
    selector: `os-comma-separated-listing`,
    templateUrl: `./comma-separated-listing.component.html`,
    styleUrls: [`./comma-separated-listing.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommaSeparatedListingComponent<T = unknown> {
    /**
     * Declare the templateRef to coexist between parent in child
     */
    @ContentChild(TemplateRef, { static: true })
    public templateRef: TemplateRef<{ $implicit: T }>;

    @Input()
    public list: T[] = [];

    @Input()
    public useMidpoint = false;

    /**
     * If it is bigger than 0, the listing will be ellipsed after showElementsAmount elements.
     */
    @Input() public showElementsAmount = 0;

    public get ellipsed(): boolean {
        return this.showElementsAmount > 0 && this.showElementsAmount < this.list.length;
    }

    public get shortenedList(): T[] {
        return this.ellipsed ? this.list.slice(0, this.showElementsAmount) : this.list;
    }

    public constructor() {}
}
