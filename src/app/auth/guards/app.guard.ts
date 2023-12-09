import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { CanActivate, CanLoad, Router ,ActivatedRoute ,ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AppGuard implements CanActivate, CanLoad {
  id: string;
   private readonly JWT_TOKEN = "JWT_TOKEN";
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {

    this.id = this.route.snapshot.paramMap.get('jwt_token');
     console.log(" App Construct typeof this.id "+(typeof this.id != undefined || this.id != null) )
    if (this.id != undefined || this.id != null ) {
        // set the jwt_token
          localStorage.setItem(this.JWT_TOKEN, this.id);
    }
  }

  canActivate(next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> {
    console.log('[ResetPasswordGuard]', JSON.stringify(next.params)); 
    console.log('[queryParamMap]', JSON.stringify(next.queryParamMap)); 
    console.log('[paramMap]', JSON.stringify(next.paramMap)); 

    
    this.id = next.paramMap.get('jwt_token');
    let qid = next.queryParamMap.get('jwt_token')
    console.log(" typeof this.id "+(typeof this.id != undefined || this.id != null) )
    if( this.id != undefined || this.id != null ) {
        console.log(" this.id "+this.id)
        // set the jwt_token
          localStorage.setItem(this.JWT_TOKEN, this.id);
       
    }
    else if ( qid != undefined || qid != null ){
       console.log(" qid "+qid)
       // set the jwt_token
          localStorage.setItem(this.JWT_TOKEN, qid);
    }
    else{
          console.log("token not in path and query param ")
        }
    console.log("app CanActiate")
    return this.canLoad();
  }

  canLoad(): Observable<boolean> {
    console.log("app canLoad ")
    return this.authService.isLoggedIn$().pipe(
      tap((isLoggedIn) => {
        if (!isLoggedIn) {
          this.router.navigate(["/login"]);
        }
      })
    );
  }
}
