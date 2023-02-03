import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AutofocusDirective } from './autofocus/autofocus.directive';
import { MeetingSettingDirective } from './meeting-setting/meeting-setting.directive';
import { OnlyNumberDirective } from './only-number/only-number.directive';
import { PaperDirective } from './paper/paper.directive';
import { CmlPermsDirective } from './perms/cml-perms.directive';
import { OmlPermsDirective } from './perms/oml-perms.directive';
import { PermsDirective } from './perms/perms.directive';
import { ResizedDirective } from './resized/resized.directive';
import { TrimOnPasteDirective } from './trim-on-paste/trim-on-paste.directive';

const DIRECTIVES = [
    OnlyNumberDirective,
    PermsDirective,
    OmlPermsDirective,
    CmlPermsDirective,
    AutofocusDirective,
    ResizedDirective,
    MeetingSettingDirective,
    PaperDirective,
    TrimOnPasteDirective
];

@NgModule({
    exports: DIRECTIVES,
    declarations: DIRECTIVES,
    imports: [CommonModule]
})
export class DirectivesModule {}
