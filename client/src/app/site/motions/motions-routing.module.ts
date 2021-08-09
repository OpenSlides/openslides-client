import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { Permission } from 'app/core/core-services/permission';

const routes: Route[] = [
    {
        path: '',
        loadChildren: () => import('./modules/motion-list/motion-list.module').then(m => m.MotionListModule),
        pathMatch: 'full'
    },
    {
        path: 'import',
        loadChildren: () => import('./modules/motion-import/motion-import.module').then(m => m.MotionImportModule),
        data: { basePerm: Permission.motionCanManage }
    },
    {
        path: 'statute-paragraphs',
        loadChildren: () =>
            import('./modules/statute-paragraph/statute-paragraph.module').then(m => m.StatuteParagraphModule),
        data: { basePerm: Permission.motionCanManage }
    },
    {
        path: 'comment-section',
        loadChildren: () =>
            import('./modules/motion-comment-section/motion-comment-section.module').then(
                m => m.MotionCommentSectionModule
            ),
        data: { basePerm: Permission.motionCanManage }
    },
    {
        path: 'call-list',
        loadChildren: () => import('./modules/call-list/call-list.module').then(m => m.CallListModule),
        data: { basePerm: Permission.motionCanManage }
    },
    {
        path: 'category',
        loadChildren: () => import('./modules/motion-category/category.module').then(m => m.CategoryModule),
        data: { basePerm: Permission.motionCanSee }
    },
    {
        path: 'blocks',
        loadChildren: () => import('./modules/motion-block/motion-block.module').then(m => m.MotionBlockModule),
        data: { basePerm: Permission.motionCanSee }
    },
    {
        path: 'workflow',
        loadChildren: () =>
            import('./modules/motion-workflow/motion-workflow.module').then(m => m.MotionWorkflowModule),
        data: { basePerm: Permission.motionCanManage }
    },
    {
        path: 'new',
        loadChildren: () => import('./modules/motion-detail/motion-detail.module').then(m => m.MotionDetailModule),
        data: { basePerm: Permission.motionCanCreate }
    },
    {
        path: 'new-amendment',
        loadChildren: () => import('./modules/motion-detail/motion-detail.module').then(m => m.MotionDetailModule),
        data: { basePerm: Permission.motionCanCreateAmendments }
    },
    {
        path: 'amendments',
        loadChildren: () => import('./modules/amendment-list/amendment-list.module').then(m => m.AmendmentListModule),
        data: { basePerm: Permission.motionCanSee }
    },
    {
        path: 'polls',
        loadChildren: () => import('./modules/motion-poll/motion-poll.module').then(m => m.MotionPollModule),
        data: { basePerm: Permission.motionCanSee }
    },
    {
        path: ':id',
        loadChildren: () => import('./modules/motion-detail/motion-detail.module').then(m => m.MotionDetailModule),
        runGuardsAndResolvers: 'paramsChange',
        data: { basePerm: Permission.motionCanSee }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionsRoutingModule {}
