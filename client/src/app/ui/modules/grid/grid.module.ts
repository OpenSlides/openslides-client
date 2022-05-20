import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

import { GridComponent } from './grid/grid.component';
import { TileComponent } from './tile/tile.component';

const DECLARATIONS = [GridComponent, TileComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatDividerModule]
})
export class GridModule {}
