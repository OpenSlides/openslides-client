import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatuteParagraphListComponent } from './statute-paragraph-list.component';

xdescribe(`StatuteParagraphListComponent`, () => {
    let component: StatuteParagraphListComponent;
    let fixture: ComponentFixture<StatuteParagraphListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StatuteParagraphListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StatuteParagraphListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
