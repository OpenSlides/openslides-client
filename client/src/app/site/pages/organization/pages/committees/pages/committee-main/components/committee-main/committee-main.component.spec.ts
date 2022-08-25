import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeMainComponent } from './committee-main.component';

xdescribe(`CommitteeMainComponent`, () => {
    let component: CommitteeMainComponent;
    let fixture: ComponentFixture<CommitteeMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitteeMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
