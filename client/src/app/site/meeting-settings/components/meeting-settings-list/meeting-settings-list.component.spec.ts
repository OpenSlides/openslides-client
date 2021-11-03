import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../../e2e-imports.module';
import { MeetingSettingsFieldComponent } from '../meeting-settings-field/meeting-settings-field.component';
import { MeetingSettingsListComponent } from './meeting-settings-list.component';

describe(`SettingsListComponent`, () => {
    let component: MeetingSettingsListComponent;
    let fixture: ComponentFixture<MeetingSettingsListComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule],
                declarations: [MeetingSettingsListComponent, MeetingSettingsFieldComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingSettingsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
