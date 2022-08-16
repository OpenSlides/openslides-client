import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaMainComponent } from './agenda-main.component';

xdescribe(`AgendaMainComponent`, () => {
    let component: AgendaMainComponent;
    let fixture: ComponentFixture<AgendaMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AgendaMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AgendaMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
