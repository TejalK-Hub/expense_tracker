import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { AuthServiceService } from '../service/auth-service.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthServiceService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();

    if (authToken) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
