import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NavigationModule } from './modules/navigation/navigation.module';
import { OrganizationRoutingModule } from './organization-routing.module';

@NgModule({
    imports: [CommonModule, OrganizationRoutingModule, NavigationModule]
})
export class OrganizationModule {}
