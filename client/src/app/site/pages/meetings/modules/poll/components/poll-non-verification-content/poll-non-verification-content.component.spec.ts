import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollNonVerificationContentComponent } from './poll-non-verification-content.component';

xdescribe(`PollNonVerificationContentComponent`, () => {
    let component: PollNonVerificationContentComponent;
    let fixture: ComponentFixture<PollNonVerificationContentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PollNonVerificationContentComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollNonVerificationContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
