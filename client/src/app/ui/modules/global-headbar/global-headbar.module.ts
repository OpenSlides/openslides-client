import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalHeadbarComponent } from './components/global-headbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AccountModule } from './modules/account';

const MODULES = [MatToolbarModule, MatIconModule];
const DECLARATIONS = [GlobalHeadbarComponent];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [CommonModule, AccountModule, ...MODULES]
})
export class GlobalHeadbarModule {}
