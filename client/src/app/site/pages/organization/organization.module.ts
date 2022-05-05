import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { NavigationModule } from './modules/navigation/navigation.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, OrganizationRoutingModule, NavigationModule]
})
export class OrganizationModule {}
