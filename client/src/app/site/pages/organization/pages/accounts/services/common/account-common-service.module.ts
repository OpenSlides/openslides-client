import { NgModule } from '@angular/core';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { PromptDialogComponent } from 'src/app/ui/modules/prompt-dialog';

@NgModule({ imports: [UserComponentsModule, PromptDialogComponent] })
export class AccountCommonServiceModule {}
