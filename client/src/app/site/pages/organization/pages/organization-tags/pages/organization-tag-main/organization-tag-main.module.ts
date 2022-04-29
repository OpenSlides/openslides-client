import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationTagMainComponent } from './components/organization-tag-main/organization-tag-main.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [OrganizationTagMainComponent],
    imports: [CommonModule, RouterModule]
})
export class OrganizationTagMainModule {}
