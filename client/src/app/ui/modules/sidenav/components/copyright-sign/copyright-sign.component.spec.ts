import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyrightSignComponent } from './copyright-sign.component';

xdescribe(`CopyrightSignComponent`, () => {
    let component: CopyrightSignComponent;
    let fixture: ComponentFixture<CopyrightSignComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CopyrightSignComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CopyrightSignComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
