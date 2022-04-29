import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicImportComponent } from './topic-import.component';

describe('TopicImportComponent', () => {
    let component: TopicImportComponent;
    let fixture: ComponentFixture<TopicImportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicImportComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
