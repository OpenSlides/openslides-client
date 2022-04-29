import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatGroupDialogComponent } from './components/chat-group-dialog/chat-group-dialog.component';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
