import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantMultiselectActionsComponent } from './participant-multiselect-actions.component';

xdescribe(`ParticipantMultiselectActionsComponent`, () => {
    let component: ParticipantMultiselectActionsComponent;
    let fixture: ComponentFixture<ParticipantMultiselectActionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantMultiselectActionsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantMultiselectActionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
