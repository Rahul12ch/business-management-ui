import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { HomeComponent } from './pages/home/home';
import { ListsComponent } from './pages/lists/lists';
import { ProfileComponent } from './pages/profile/profile';
import { DashboardComponent } from './layout/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '',redirectTo: 'login',pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent},
  { path: '', component: DashboardComponent,
   canActivate: [authGuard],
   children: [
      { path: 'home', component: HomeComponent },
      { path: 'lists', component: ListsComponent},
      { path: 'profile', component: ProfileComponent}
    ]},
  { path: '**', redirectTo: 'login'}
];