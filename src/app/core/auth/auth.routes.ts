import { Route } from "@angular/router";
import { LoginComponent, RegisterComponent } from "./pages";


export const authRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('@layout').then(m => m.AuthLayoutComponent),
        children: [
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'register',
                component: RegisterComponent
            },
            {
                path: '**',
                redirectTo: 'login'
            }
        ]
    }

]