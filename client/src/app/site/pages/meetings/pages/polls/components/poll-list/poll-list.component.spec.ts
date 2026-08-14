import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollListComponent } from './poll-list.component';

xdescribe(`PollListComponent`, () => {
    let component: PollListComponent;
    let fixture: ComponentFixture<PollListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PollListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PollListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
