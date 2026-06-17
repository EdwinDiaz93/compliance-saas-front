import { Routes } from "@angular/router";
import { LocationsComponent } from "./pages";


export const locationRoutes: Routes = [
    { path: '', component: LocationsComponent },
    { path: '**', redirectTo: '' }
]