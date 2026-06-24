import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { initializePaddle } from "@paddle/paddle-js";
import { environment } from "environments";

@Injectable({ providedIn: 'root' })
export class PaddleService {
    private paddle: any;
    private router = inject(Router);
    async getInstance() {
        if (!this.paddle) {
            this.paddle = await initializePaddle({
                token: environment.paddleToken,
                environment: environment.paddleEnvironment,
                eventCallback: (data: any) => {
                    if (data.name === 'checkout.completed') {
                        this.router.navigateByUrl('/billing/success');
                    }
                }
            });
        }

        return this.paddle;
    }
}