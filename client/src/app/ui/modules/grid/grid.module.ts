import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from './grid/grid.component';
import { TileComponent } from './tile/tile.component';
import { MatDividerModule } from '@angular/material/divider';

const DECLARATIONS = [GridComponent, TileComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatDividerModule]
})
export class GridModule {}
