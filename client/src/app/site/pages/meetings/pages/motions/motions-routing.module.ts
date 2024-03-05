import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';

import { MotionMainComponent } from './components/motion-main/motion-main.component';

const routes: Routes = [
    {
        path: ``,
        component: MotionMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () => import(`./pages/motion-list/motion-list.module`).then(m => m.MotionListModule)
            },
            {
                path: `amendments`,
                loadChildren: () => import(`./pages/amendments/amendments.module`).then(m => m.AmendmentsModule),
                data: { meetingPermissions: [Permission.motionCanSee] }
            },
            {
                path: `categories`,
                loadChildren: () => import(`./pages/categories/categories.module`).then(m => m.CategoriesModule),
                data: { meetingPermissions: [Permission.motionCanSee] }
            },
            {
                path: `blocks`,
                loadChildren: () =>
                    import(`./pages/motion-blocks/motion-blocks.module`).then(m => m.MotionBlocksModule),
                data: { meetingPermissions: [Permission.motionCanSee] }
            },
            {
                path: `statute-paragraphs`,
                loadChildren: () =>
                    import(`./pages/statute-paragraphs/statute-paragraphs.module`).then(m => m.StatuteParagraphsModule),
                data: { meetingPermissions: [Permission.motionCanManage] }
            },
            {
                path: `workflows`,
                loadChildren: () => import(`./pages/workflows/workflows.module`).then(m => m.WorkflowsModule),
                data: { meetingPermissions: [Permission.motionCanManage] }
            },
            {
                path: `comment-sections`,
                loadChildren: () => import(`./pages/comments/comments.module`).then(m => m.CommentsModule),
                data: { meetingPermissions: [Permission.motionCanManage] }
            },
            {
                path: `tags`,
                loadChildren: () => import(`./pages/tags/tags.module`).then(m => m.TagsModule),
                data: { meetingPermissions: [Permission.tagCanManage] }
            },
            {
                path: `polls`,
                loadChildren: () => import(`./pages/motion-polls/motion-polls.module`).then(m => m.MotionPollsModule),
                data: { meetingPermissions: [Permission.motionCanSee] }
            },
            {
                path: `import`,
                loadChildren: () =>
                    import(`./pages/motion-import/motion-import.module`).then(m => m.MotionImportModule),
                data: { meetingPermissions: [Permission.motionCanManage] }
            },
            {
                path: `call-list`,
                loadChildren: () =>
                    import(`./pages/motion-call-list/motion-call-list.module`).then(m => m.MotionCallListModule),
                data: { meetingPermissions: [Permission.motionCanManage] }
            },
            {
                path: ``,
                loadChildren: () =>
                    import(`./pages/motion-detail/motion-detail.module`).then(m => m.MotionDetailModule),
                data: { meetingPermissions: [Permission.motionCanSee] }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionsRoutingModule {}
