import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoSearchSelectorComponent } from './repo-search-selector.component';

xdescribe(`RepoSearchSelectorComponent`, () => {
    let component: RepoSearchSelectorComponent;
    let fixture: ComponentFixture<RepoSearchSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RepoSearchSelectorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RepoSearchSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
