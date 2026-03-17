import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../service/auth-service.service';


export const authGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthServiceService);
  const router = inject(Router);

  // not logged in
  if (!auth.userToken) {
    router.navigate(['/']);
    return false;
  }

  // role restriction
  const requiredRole = route.data?.['role'];

  if (requiredRole && auth.userRole !== requiredRole) {
    router.navigate(['/']);
    return false;
  }

  return true;

};
