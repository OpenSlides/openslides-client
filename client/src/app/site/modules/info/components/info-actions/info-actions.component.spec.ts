import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoActionsComponent } from './info-actions.component';

xdescribe(`InfoActionsComponent`, () => {
    let component: InfoActionsComponent;
    let fixture: ComponentFixture<InfoActionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfoActionsComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(InfoActionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
