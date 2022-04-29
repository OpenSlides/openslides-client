import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DesignsRoutingModule } from './designs-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
import { ColorFormFieldModule } from 'src/app/ui/modules/color-form-field';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DesignMainModule } from './pages/design-main/design-main.module';

const NG_MODULES = [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule
];
const CUSTOM_MODULES = [OpenSlidesTranslationModule.forChild(), ColorFormFieldModule, ListModule, HeadBarModule];

@NgModule({
    declarations: [],
    imports: [CommonModule, DesignsRoutingModule, DesignMainModule, ...NG_MODULES, ...CUSTOM_MODULES]
})
export class DesignsModule {}
