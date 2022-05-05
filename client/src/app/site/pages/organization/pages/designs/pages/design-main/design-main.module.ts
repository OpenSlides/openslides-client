import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignMainComponent } from './components/design-main/design-main.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [DesignMainComponent],
    imports: [CommonModule, RouterModule]
})
export class DesignMainModule {}
