import { NgModule } from '@angular/core';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

@NgModule({ imports: [UserComponentsModule, PromptDialogModule] })
export class AccountCommonServiceModule {}
