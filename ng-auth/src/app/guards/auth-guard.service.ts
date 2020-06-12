import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwtHelper: JwtHelperService, private router: Router, private http: HttpClient) {
  }
  async canActivate() {
    var token = localStorage.getItem("jwt");

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      console.log(this.jwtHelper.decodeToken(token));
      return true;
    }

    var isRefreshSuccess = await this.tryRefreshingTokens(token);
    if (!isRefreshSuccess) {
      this.router.navigate(["login"]);
    }

    return isRefreshSuccess;
  }

  private async tryRefreshingTokens(token: string): Promise<boolean> {
    // Try refreshing tokens using refresh token
    let refreshToken: string = localStorage.getItem("refreshToken");
    let credentials = JSON.stringify({ accessToken: token, refreshToken: refreshToken });

    var isRefreshSuccess: boolean;
    try {
      var response = await this.http.post("http://localhost:5000/api/token/refresh", credentials, {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        }),
        observe: 'response'
      }).toPromise();
      // If token refresh is successful, set new tokens in local storage.
      token = (<any>response).body.accessToken;
      refreshToken = (<any>response).body.refreshToken;
      localStorage.setItem("jwt", token);
      localStorage.setItem("refreshToken", refreshToken);
      isRefreshSuccess = true;
    }
    catch (ex) {      
      isRefreshSuccess = false;
    }
    return isRefreshSuccess;
  }

}
