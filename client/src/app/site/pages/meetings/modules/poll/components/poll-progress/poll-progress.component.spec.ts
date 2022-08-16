import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollProgressComponent } from './poll-progress.component';

xdescribe(`PollProgressComponent`, () => {
    let component: PollProgressComponent;
    let fixture: ComponentFixture<PollProgressComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PollProgressComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PollProgressComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
