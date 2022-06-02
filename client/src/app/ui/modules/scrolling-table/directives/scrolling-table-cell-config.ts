import { ScrollingTableCellPosition } from './scrolling-table-cell-position';

export interface ScrollingTableCellDefConfig {
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    position?: ScrollingTableCellPosition;
}
