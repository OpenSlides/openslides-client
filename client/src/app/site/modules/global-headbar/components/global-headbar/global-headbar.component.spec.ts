import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalHeadbarComponent } from './global-headbar.component';

describe(`GlobalHeadbarComponent`, () => {
    let component: GlobalHeadbarComponent;
    let fixture: ComponentFixture<GlobalHeadbarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
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
