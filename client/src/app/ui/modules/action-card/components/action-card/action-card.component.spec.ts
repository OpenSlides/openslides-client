import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionCardComponent } from './action-card.component';

xdescribe(`ActionCardComponent`, () => {
    let component: ActionCardComponent;
    let fixture: ComponentFixture<ActionCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ActionCardComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ActionCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
