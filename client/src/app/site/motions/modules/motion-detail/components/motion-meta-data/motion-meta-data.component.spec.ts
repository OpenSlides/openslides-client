import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionMetaDataComponent } from './motion-meta-data.component';

describe('MotionMetaDataComponent', () => {
    let component: MotionMetaDataComponent;
    let fixture: ComponentFixture<MotionMetaDataComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MotionMetaDataComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionMetaDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
