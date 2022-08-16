import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollingTableComponent } from './scrolling-table.component';

xdescribe(`ScrollingTableComponent`, () => {
    let component: ScrollingTableComponent<any>;
    let fixture: ComponentFixture<ScrollingTableComponent<any>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ScrollingTableComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ScrollingTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
