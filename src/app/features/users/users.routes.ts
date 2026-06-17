import { Routes } from "@angular/router";
import { UsersComponent } from "./pages";


export const usersRoutes: Routes = [
    { path: '', component: UsersComponent },
    { path: '**', redirectTo: '' }
]