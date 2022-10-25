import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteTokenSecretFieldComponent } from './vote-token-secret-field.component';

describe(`VoteTokenSecretFieldComponent`, () => {
    let component: VoteTokenSecretFieldComponent;
    let fixture: ComponentFixture<VoteTokenSecretFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VoteTokenSecretFieldComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(VoteTokenSecretFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
