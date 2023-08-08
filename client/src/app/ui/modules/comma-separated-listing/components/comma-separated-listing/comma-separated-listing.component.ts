import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
    selector: `os-comma-separated-listing`,
    templateUrl: `./comma-separated-listing.component.html`,
    styleUrls: [`./comma-separated-listing.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommaSeparatedListingComponent<T = any> {
    /**
     * Declare the templateRef to coexist between parent in child
     */
    @ContentChild(TemplateRef, { static: true })
    public templateRef: TemplateRef<T>;

    @Input()
    public list: T[] = [];

    constructor() {}
}
