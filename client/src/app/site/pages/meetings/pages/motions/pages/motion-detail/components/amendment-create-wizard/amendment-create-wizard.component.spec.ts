import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmendmentCreateWizardComponent } from './amendment-create-wizard.component';

xdescribe(`AmendmentCreateWizardComponent`, () => {
    let component: AmendmentCreateWizardComponent;
    let fixture: ComponentFixture<AmendmentCreateWizardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AmendmentCreateWizardComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AmendmentCreateWizardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
