import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { ChatGroupDialogComponent } from './components/chat-group-dialog/chat-group-dialog.component';

@NgModule({
    declarations: [ChatGroupDialogComponent],
    imports: [
        CommonModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild(),
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule
    ]
})
export class ChatGroupDialogModule {
    public static getComponent(): typeof ChatGroupDialogComponent {
        return ChatGroupDialogComponent;
    }
}
