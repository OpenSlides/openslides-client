import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { StatuteParagraphImportListComponent } from './components/statute-paragraph-import-list/statute-paragraph-import-list.component';
import { StatuteParagraphListComponent } from './components/statute-paragraph-list/statute-paragraph-list.component';
import { StatuteParagraphRoutingModule } from './statute-paragraph-routing.module';

@NgModule({
    declarations: [StatuteParagraphListComponent, StatuteParagraphImportListComponent],
    imports: [CommonModule, StatuteParagraphRoutingModule, SharedModule]
})
export class StatuteParagraphModule {}
