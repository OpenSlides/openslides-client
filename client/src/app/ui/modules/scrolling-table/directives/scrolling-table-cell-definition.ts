import { TemplatePortal } from '@angular/cdk/portal';
import { TemplateRef } from '@angular/core';

import { ScrollingTableCellPosition } from './scrolling-table-cell-position';

export interface ScrollingTableCellDefinition {
    readonly property: string;
    readonly isHidden: boolean;
    readonly labelString: string;
    readonly labelTemplate: TemplatePortal;
    readonly width: string;
    readonly minWidth: string;
    readonly maxWidth: string;
    readonly position: ScrollingTableCellPosition;
    readonly template: TemplateRef<any>;
}
