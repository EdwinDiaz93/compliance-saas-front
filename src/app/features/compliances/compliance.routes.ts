import { Routes } from "@angular/router";
import { CompliancesComponent } from "./pages";


export const complianceRoutes: Routes = [
    { path: '', component: CompliancesComponent },
    { path: '**', redirectTo: '' }
]