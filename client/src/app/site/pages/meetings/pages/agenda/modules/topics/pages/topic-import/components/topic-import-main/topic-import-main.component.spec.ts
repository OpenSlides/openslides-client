import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicImportMainComponent } from './topic-import-main.component';

xdescribe(`TopicDetailMainComponent`, () => {
    let component: TopicImportMainComponent;
    let fixture: ComponentFixture<TopicImportMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicImportMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicImportMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
