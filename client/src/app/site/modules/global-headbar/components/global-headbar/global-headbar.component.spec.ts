import { ComponentFixture, TestBed } from '@angular/core/testing';
import {GlobalHeadbarModule} from '../../global-headbar.module';

import { GlobalHeadbarComponent } from './global-headbar.component';

xdescribe(`GlobalHeadbarComponent`, () => {
    let component: GlobalHeadbarComponent;
    let fixture: ComponentFixture<GlobalHeadbarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GlobalHeadbarModule],
            declarations: [GlobalHeadbarComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GlobalHeadbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
