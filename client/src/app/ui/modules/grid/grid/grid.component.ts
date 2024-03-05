import { Component, ContentChildren, Input, QueryList } from '@angular/core';

import { TileComponent } from '../tile/tile.component';

@Component({
    selector: `os-grid`,
    templateUrl: `./grid.component.html`,
    styleUrls: [`./grid.component.scss`]
})
export class GridComponent {
    @ContentChildren(TileComponent, { descendants: false })
    public readonly tiles!: QueryList<TileComponent>;

    /**
     * Property for an optional title.
     */
    @Input()
    public title: string | null = null;

    /**
     * If the grid layout should have no space.
     * This contains the padding for the grid itself and the margin of the tiles.
     */
    @Input()
    public noSpace = false;

    /**
     * Defines the height of every card
     */
    @Input()
    public rowHeight = `100%`;
}
