import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantCreateWizardComponent } from './participant-create-wizard.component';

xdescribe(`ParticipantCreateWizardComponent`, () => {
    let component: ParticipantCreateWizardComponent;
    let fixture: ComponentFixture<ParticipantCreateWizardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantCreateWizardComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantCreateWizardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
