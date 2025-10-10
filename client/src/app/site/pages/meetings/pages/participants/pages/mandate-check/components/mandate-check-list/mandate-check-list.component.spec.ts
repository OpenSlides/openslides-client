import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandateCheckListComponent } from './mandate-check-list.component';

xdescribe('MandateCheckListComponent', () => {
    let component: MandateCheckListComponent;
    let fixture: ComponentFixture<MandateCheckListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MandateCheckListComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(MandateCheckListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
