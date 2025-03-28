import { CdkPortal } from '@angular/cdk/portal';
import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';

import { ScrollingTableCellDirective } from './scrolling-table-cell.directive';

@Directive({
    selector: `[osScrollingTableCellLabel]`,
    standalone: false
})
export class ScrollingTableCellLabelDirective extends CdkPortal {
    public constructor(
        template: TemplateRef<HTMLElement>,
        viewContainer: ViewContainerRef,
        host: ScrollingTableCellDirective
    ) {
        super(template, viewContainer);
        host.labelTemplate = this; // Propagate the template to the host
    }
}
