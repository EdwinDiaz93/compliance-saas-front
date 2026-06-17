import {  Routes } from "@angular/router";
import { AuthoritiesComponent } from "./pages";


export const authorityRoutes: Routes = [
    { path: '', component: AuthoritiesComponent },
    { path: '**', redirectTo: '' }
]