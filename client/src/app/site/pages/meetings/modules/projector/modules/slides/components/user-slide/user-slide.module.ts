import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SlideToken } from '../../definitions';
import { UserSlideComponent } from './components/user-slide.component';
@NgModule({
    imports: [CommonModule],
    declarations: [UserSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: UserSlideComponent }]
})
export class UserSlideModule {}
