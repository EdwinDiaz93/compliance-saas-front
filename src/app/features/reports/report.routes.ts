import { Routes} from "@angular/router";
import { ReportsComponent } from "./pages";


export const reportRoutes: Routes = [
    { path: '', component: ReportsComponent },
    { path: '**', redirectTo: '' }
]