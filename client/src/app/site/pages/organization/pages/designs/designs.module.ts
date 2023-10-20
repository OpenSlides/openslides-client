import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ColorFormFieldModule } from 'src/app/ui/modules/color-form-field';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';

import { DesignsRoutingModule } from './designs-routing.module';
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
