import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDeleteDialogComponent } from './components/user-delete-dialog/user-delete-dialog.component';
import { MatDividerModule } from '@angular/material/divider';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from '../../../site/modules/translations/openslides-translation.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserDetailViewComponent } from './components/user-detail-view/user-detail-view.component';
import { UserPasswordFormComponent } from './components/user-password-form/user-password-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { PasswordFormComponent } from './components/password-form/password-form.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

const DECLARATIONS = [
    UserDeleteDialogComponent,
    UserDetailViewComponent,
    UserPasswordFormComponent,
    PasswordFormComponent
];

const MODULES = [MatInputModule];

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
        MatCheckboxModule,
        MatDividerModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatCardModule,
        MatSelectModule,
        MatButtonModule,
        ...MODULES
    ]
})
export class UserComponentsModule {
    public static getComponent(): typeof UserDeleteDialogComponent {
        return UserDeleteDialogComponent;
    }
}
