import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { HomeComponent } from './pages/home/home';
import { ListsComponent } from './pages/lists/lists';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ProfileComponent } from './pages/profile/profile';
import { LayoutComponent } from './layout/layout/layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'home', component: HomeComponent },
      { path: 'lists', component: ListsComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];