import { ComponentFixture, TestBed } from '@angular/core/testing';

import { C4DialogComponent } from './c4-dialog.component';

xdescribe(`C4DialogComponent`, () => {
    let component: C4DialogComponent;
    let fixture: ComponentFixture<C4DialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [C4DialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(C4DialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
