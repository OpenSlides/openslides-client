import { AfterViewInit, Component, forwardRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import OfficePaste from '@intevation/tiptap-extension-office-paste';
import { Extension } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { UndoRedo } from '@tiptap/extensions';
import { Permission } from 'src/app/domain/definitions/permission';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { EditorComponent } from '../../../../../../../ui/modules/editor/components/editor/editor.component';
import {
    OsSplit,
    OsSplitBulletList,
    OsSplitListItem,
    OsSplitOrderedList
} from '../../../../../../../ui/modules/editor/components/editor/extensions/os-split';
import { TextStyle } from '../../../../../../../ui/modules/editor/components/editor/extensions/text-style';

@Component({
    selector: `os-motion-editor`,

    templateUrl: `../../../../../../../ui/modules/editor/components/editor/editor.component.html`,
    styleUrls: [`../../../../../../../ui/modules/editor/components/editor/editor.component.scss`],
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MotionEditorComponent), multi: true }],
    standalone: false
})
export class MotionEditorComponent extends EditorComponent implements AfterViewInit {
    private nonManagerSetting = false;
    private managerSetting = false;

    private canManage = false;

    protected operator: OperatorService = inject(OperatorService);

    public constructor(private meetingSettingsService: MeetingSettingsService) {
        super();

        this.nonManagerSetting = this.meetingSettingsService.instant(
            `motions_enable_restricted_editor_for_non_manager`
        );
        this.managerSetting = this.meetingSettingsService.instant(`motions_enable_restricted_editor_for_manager`);

        this.canManage = this.operator.hasPerms(Permission.motionCanManage);
    }

    public override getExtensions(): Extension[] {
        if ((this.canManage && this.managerSetting) || (!this.canManage && this.nonManagerSetting)) {
            return [
                OfficePaste,
                // Nodes
                Document,
                HardBreak,
                Heading,
                OsSplitBulletList,
                OsSplitOrderedList,
                OsSplitListItem,
                Paragraph,
                Text,

                // Marks
                Bold,
                TextStyle,

                // Extensions
                UndoRedo,
                OsSplit,
                this.ngExtension()
            ];
        }
        return super.getExtensions();
    }
}
