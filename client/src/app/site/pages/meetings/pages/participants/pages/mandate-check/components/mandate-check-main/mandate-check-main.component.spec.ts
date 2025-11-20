import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandateCheckMainComponent } from './mandate-check-main.component';

xdescribe('MandateCheckMainComponent', () => {
    let component: MandateCheckMainComponent;
    let fixture: ComponentFixture<MandateCheckMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MandateCheckMainComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(MandateCheckMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
