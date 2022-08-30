import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeListComponent } from './committee-list.component';

xdescribe(`CommitteeListComponent`, () => {
    let component: CommitteeListComponent;
    let fixture: ComponentFixture<CommitteeListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitteeListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
