import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatSelectModule } from '@angular/material/select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';

import { OpenSlidesTranslationModule } from '../../../site/modules/translations/openslides-translation.module';
import { PasswordFormComponent } from './components/password-form/password-form.component';
import { UserDeleteDialogComponent } from './components/user-delete-dialog/user-delete-dialog.component';
import { UserDetailViewComponent } from './components/user-detail-view/user-detail-view.component';
import { UserMultiselectActionsComponent } from './components/user-multiselect-actions/user-multiselect-actions.component';
import { UserPasswordFormComponent } from './components/user-password-form/user-password-form.component';

const DECLARATIONS = [
    UserDeleteDialogComponent,
    UserDetailViewComponent,
    UserPasswordFormComponent,
    UserMultiselectActionsComponent,
    PasswordFormComponent
];

const MODULES = [MatInputModule, MatMenuModule];

@NgModule({
    declarations: DECLARATIONS,
    exports: [...DECLARATIONS, ...MODULES],
    imports: [
        CommonModule,
        IconContainerModule,
        OpenSlidesTranslationModule.forChild(),
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatCardModule,
        MatSelectModule,
        ...MODULES
    ]
})
export class UserComponentsModule {
    public static getComponent(): typeof UserDeleteDialogComponent {
        return UserDeleteDialogComponent;
    }
}
