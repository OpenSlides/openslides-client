import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlyNumberDirective } from './only-number/only-number.directive';
import { PermsDirective } from './perms/perms.directive';
import { OmlPermsDirective } from './perms/oml-perms.directive';
import { CmlPermsDirective } from './perms/cml-perms.directive';
import { AutofocusDirective } from './autofocus/autofocus.directive';
import { ResizedDirective } from './resized/resized.directive';
import { MeetingSettingDirective } from './meeting-setting/meeting-setting.directive';
import { PaperDirective } from './paper/paper.directive';

const DIRECTIVES = [
    OnlyNumberDirective,
    PermsDirective,
    OmlPermsDirective,
    CmlPermsDirective,
    AutofocusDirective,
    ResizedDirective,
    MeetingSettingDirective,
    PaperDirective
];

@NgModule({
    exports: DIRECTIVES,
    declarations: DIRECTIVES,
    imports: [CommonModule]
})
export class DirectivesModule {}
