import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { ProductDetailsPage } from './pages/product-details-page/product-details-page';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';
import { AdminGuard } from './guards/admin.guard';
import { NotFound } from './pages/not-found/not-found';
import { CartPageComponent } from './pages/cart-page/cart-page';
import { AuthGuard } from './guards/auth.guard';
import { OrdersComponent } from './components/orders/orders.component';
export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'product-details/:id', component: ProductDetailsPage },
  { path: 'dashboard', component: DashboardPage, canActivate: [AuthGuard,AdminGuard] },
  {path:'cart', component:CartPageComponent, canActivate:[AuthGuard]},
  { path: 'login', component: LoginPage },
  {path: 'search', component: HomePage },
  {path: 'profile', component: DashboardPage, canActivate: [AuthGuard]},
  {path: 'orders', component: OrdersComponent, canActivate: [AuthGuard]},
  { path: 'register', component: RegisterPage },
  { path: '**', component:NotFound }
];
