import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerticalTabGroupComponent } from './components/vertical-tab-group/vertical-tab-group.component';
import { VerticalTabGroupLabelHeaderDirective } from './directives/vertical-tab-group-label-header.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTabsModule } from '@angular/material/tabs';
import { PortalModule } from '@angular/cdk/portal';

const DECLARATIONS = [VerticalTabGroupComponent, VerticalTabGroupLabelHeaderDirective];

@NgModule({
    declarations: DECLARATIONS,
    exports: [...DECLARATIONS, MatTabsModule],
    imports: [CommonModule, MatIconModule, MatDividerModule, MatTabsModule, ScrollingModule, PortalModule]
})
export class VerticalTabGroupModule {}
