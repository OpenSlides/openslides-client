import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { OrganizationTagMainComponent } from './components/organization-tag-main/organization-tag-main.component';

@NgModule({
    declarations: [OrganizationTagMainComponent],
    imports: [CommonModule, RouterModule]
})
export class OrganizationTagMainModule {}
