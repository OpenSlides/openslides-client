import { CdkPortal } from '@angular/cdk/portal';
import { Directive } from '@angular/core';

import { ScrollingTableCellDirective } from './scrolling-table-cell.directive';

@Directive({
    selector: `[osScrollingTableCellLabel]`,
    standalone: false
})
export class ScrollingTableCellLabelDirective extends CdkPortal {
    public constructor(host: ScrollingTableCellDirective) {
        super();
        host.labelTemplate = this; // Propagate the template to the host
    }
}
