import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { Permission } from 'app/core/core-services/permission';

import { AuthGuard } from '../core/core-services/auth-guard.service';
import { LoginLegalNoticeComponent } from './login/components/login-legal-notice/login-legal-notice.component';
import { LoginMaskComponent } from './login/components/login-mask/login-mask.component';
import { LoginPrivacyPolicyComponent } from './login/components/login-privacy-policy/login-privacy-policy.component';
import { LoginWrapperComponent } from './login/components/login-wrapper/login-wrapper.component';
import { ResetPasswordComponent } from './login/components/reset-password/reset-password.component';
import { ResetPasswordConfirmComponent } from './login/components/reset-password-confirm/reset-password-confirm.component';
import { UnsupportedBrowserComponent } from './login/components/unsupported-browser/unsupported-browser.component';
import { SiteComponent } from './site.component';

/**
 * Routung to all OpenSlides apps
 *
 * TODO: Plugins will have to append to the Routes-Array
 */
const routes: Route[] = [
    {
        path: ``,
        component: SiteComponent,
        children: [
            {
                path: ``,
                loadChildren: () => import(`./common/os-common.module`).then(m => m.OsCommonModule)
            },
            {
                path: `agenda`,
                loadChildren: () => import(`./agenda/agenda.module`).then(m => m.AgendaModule),
                data: { basePerm: Permission.agendaItemCanSee }
            },
            {
                path: `topics`,
                loadChildren: () => import(`./topics/topics.module`).then(m => m.TopicsModule),
                data: { basePerm: Permission.agendaItemCanSee }
            },
            {
                path: `assignments`,
                loadChildren: () => import(`./assignments/assignments.module`).then(m => m.AssignmentsModule),
                data: { basePerm: Permission.assignmentCanSee }
            },
            {
                path: `mediafiles`,
                loadChildren: () => import(`./mediafiles/mediafiles.module`).then(m => m.MediafilesModule),
                data: { basePerm: Permission.mediafileCanSee }
            },
            {
                path: `motions`,
                loadChildren: () => import(`./motions/motions.module`).then(m => m.MotionsModule),
                data: { basePerm: Permission.motionCanSee }
            },
            {
                path: `settings`,
                loadChildren: () =>
                    import(`./meeting-settings/meeting-settings.module`).then(m => m.MeetingSettingsModule),
                data: { basePerm: Permission.meetingCanManageSettings }
            },
            {
                path: `users`,
                loadChildren: () => import(`./users/users.module`).then(m => m.UsersModule)
                // No baseperm, because change own password is ok, even if the
                // user does not have users.can_see_name
            },
            {
                path: `tags`,
                loadChildren: () => import(`./tags/tag.module`).then(m => m.TagModule),
                data: { basePerm: Permission.tagCanManage }
            },
            // {
            //     path: 'history',
            //     loadChildren: () => import('./history/history.module').then(m => m.HistoryModule),
            //     data: { basePerm: Permission.meetingCanSeeHistory }
            // },
            {
                path: `projectors`,
                loadChildren: () => import(`./projector/projector.module`).then(m => m.ProjectorModule),
                data: { basePerm: Permission.projectorCanSee }
            },
            {
                path: `polls`,
                loadChildren: () => import(`./polls/polls.module`).then(m => m.PollsModule),
                // one of them is sufficient
                data: { basePerm: [Permission.motionCanSee, Permission.assignmentCanSee] }
            },
            {
                path: `autopilot`,
                loadChildren: () => import(`./cinema/cinema.module`).then(m => m.CinemaModule),
                data: { basePerm: Permission.meetingCanSeeAutopilot }
            }
        ],
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard]
    },
    {
        path: `projector`,
        loadChildren: () =>
            import(`../fullscreen/fullscreen-projector/fullscreen-projector.module`).then(
                m => m.FullscreenProjectorModule
            ),
        data: { noInterruption: true }
    },
    // meeting-specific login-routing
    {
        path: `login`,
        component: LoginWrapperComponent,
        children: [
            { path: ``, component: LoginMaskComponent, pathMatch: `full` },
            { path: `reset-password`, component: ResetPasswordComponent },
            { path: `reset-password-confirm`, component: ResetPasswordConfirmComponent },
            { path: `legalnotice`, component: LoginLegalNoticeComponent },
            { path: `privacypolicy`, component: LoginPrivacyPolicyComponent },
            { path: `unsupported-browser`, component: UnsupportedBrowserComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SiteRoutingModule {}
