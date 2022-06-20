import { CdkPortal } from '@angular/cdk/portal';
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { ScrollingTableCellDirective } from './scrolling-table-cell.directive';

@Directive({
    selector: `[osScrollingTableCellIsHidden]`
})
export class ScrollingTableCellIsHiddenDirective extends CdkPortal {
    @Input()
    public set osScrollingTableCellIsHidden(property: boolean) {
        this.host.isHidden = property; // Propagate the template to the host
    }

    public constructor(
        template: TemplateRef<HTMLElement>,
        viewContainer: ViewContainerRef,
        private host: ScrollingTableCellDirective
    ) {
        super(template, viewContainer);
    }
}
