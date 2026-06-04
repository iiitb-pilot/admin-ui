import { LoginRedirectService } from './loginredirect.service';
import { Router } from '@angular/router';
import { ResponseModel } from './../models/response.model';
import { LogoutResponse } from './../models/logoutresponse';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private redirectService: LoginRedirectService,
    private appService: AppConfigService
  ) {}

logout() {
    //TODO: NEED TO CHECK THE IMPLEMENTATION LATER
    window.location.href = `${this.appService.getConfig().baseUrl}${this.appService.getConfig().logout}?redirecturi=`+btoa(window.location.href);
  }
}
