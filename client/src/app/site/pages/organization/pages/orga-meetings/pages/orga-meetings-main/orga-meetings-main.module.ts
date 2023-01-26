import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { OrgaMeetingsMainComponent } from './components/orga-meetings-main/orga-meetings-main.component';

@NgModule({
    declarations: [OrgaMeetingsMainComponent],
    imports: [CommonModule, RouterModule]
})
export class OrgaMeetingsMainModule {}
