import { AfterViewInit, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import OfficePaste from '@intevation/tiptap-extension-office-paste';
import { Editor, Extension } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Italic } from '@tiptap/extension-italic';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { UndoRedo } from '@tiptap/extensions';
import { Permission } from 'src/app/domain/definitions/permission';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

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
    private allowEditorLimitNonManager = false;
    private allowEditorLimitManager = false;

    public constructor(private meetingSettingsService: MeetingSettingsService) {
        super();

        this.subscriptions.push(
            this.meetingSettingsService.get(`motions_enable_restricted_editor_for_non_manager`).subscribe(enabled => {
                this.allowEditorLimitNonManager = !this.operator.hasPerms(Permission.motionCanManage) && enabled;
            }),
            this.meetingSettingsService.get(`motions_enable_restricted_editor_for_manager`).subscribe(enabled => {
                this.allowEditorLimitManager = this.operator.hasPerms(Permission.motionCanManage) && enabled;
            })
        );
    }

    public override ngAfterViewInit(): void {
        if (this.allowEditorLimitNonManager || this.allowEditorLimitManager) {
            const editorConfig = {
                element: this.editorEl.nativeElement,
                extensions: [
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
                    Italic,
                    TextStyle,

                    // Extensions
                    UndoRedo,
                    TextAlign.configure({
                        types: [`heading`, `paragraph`]
                    }),
                    OsSplit,
                    Extension.create({
                        name: `angular-component-ext`,
                        onCreate: () => {
                            this.editorReady = true;
                            this.cd.detectChanges();
                        },
                        onDestroy: () => {
                            this.editorReady = false;
                            this.leaveFocus.emit();
                        },
                        onBlur: () => {
                            this.leaveFocus.emit();
                        },
                        onSelectionUpdate: () => {
                            this.cd.detectChanges();
                        },
                        onUpdate: () => {
                            const content = this.cleanupOutput(this.editor.getHTML());
                            if (this.value != content) {
                                this.updateForm(content);
                            }
                        }
                    })
                ],
                content: this.value
            };

            this.editor = new Editor(editorConfig);
            this.updateColorSets();
        } else {
            super.ngAfterViewInit();
        }
    }

    public isEditorLimited(): boolean {
        return this.allowEditorLimitNonManager || this.allowEditorLimitManager;
    }
}
