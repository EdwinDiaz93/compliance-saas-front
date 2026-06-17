import { Routes } from "@angular/router";
import { DashboardComponent } from "./pages";


export const dashboardRoutes: Routes = [
    { path: '', component: DashboardComponent },
    { path: '**', redirectTo: '' }
]