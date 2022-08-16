import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeDetailComponent } from './committee-detail.component';

xdescribe(`CommitteeDetailComponent`, () => {
    let component: CommitteeDetailComponent;
    let fixture: ComponentFixture<CommitteeDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitteeDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
