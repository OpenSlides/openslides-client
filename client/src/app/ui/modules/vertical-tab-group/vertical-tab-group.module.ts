import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';

import { VerticalTabGroupComponent } from './components/vertical-tab-group/vertical-tab-group.component';
import { VerticalTabGroupLabelHeaderDirective } from './directives/vertical-tab-group-label-header.directive';

const DECLARATIONS = [VerticalTabGroupComponent, VerticalTabGroupLabelHeaderDirective];

@NgModule({
    declarations: DECLARATIONS,
    exports: [...DECLARATIONS, MatTabsModule],
    imports: [CommonModule, MatIconModule, MatDividerModule, MatTabsModule, ScrollingModule, PortalModule]
})
export class VerticalTabGroupModule {}
