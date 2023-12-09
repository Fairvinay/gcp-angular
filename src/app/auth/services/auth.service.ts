import { Injectable, Inject } from "@angular/core";
import { HttpClient , HttpHeaders ,HttpErrorResponse } from "@angular/common/http";
// using capacitor 
import { CapacitorHttp , HttpResponse  } from '@capacitor/core';
import { Router } from "@angular/router";
import { Observable, of , from} from "rxjs";
import { tap, map, catchError } from "rxjs/operators";

import { config, auth0 } from "../../core/config";
import { CacheService } from "../../core/cache.service";
import { AuthStrategy, AUTH_STRATEGY } from "./auth.strategy";
import { LoginRequest } from "@models/loginRequest";
import { User } from "@models/user";
import { Role } from "@models/types";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public readonly INITIAL_PATH = "/app/dashboard";
  public readonly ADMIN_PATH = "/admin";
  public readonly LOGIN_PATH = "/login";
  public readonly LOGOUT_PATH = "/logout";

  public readonly CONFIRM_PATH = "/confirm";

  constructor(
    private router: Router,
    private http: HttpClient,
    private cacheService: CacheService,
    @Inject(AUTH_STRATEGY) private auth: AuthStrategy<any>
  ) {}

  getInitialPathForRole(role: Role): string {
    return role === "ADMIN" ? this.ADMIN_PATH : this.INITIAL_PATH;
  }

  signup(user: User): Observable<any> {
    return this.http.post<any>(`${config.authUrl}/signup`, user);
  }

  confirm(email: string, code: string): Observable<void> {
    return this.http.post<any>(`${config.authUrl}/confirm?`, { email, code });
  }

   errorHandler(error: HttpErrorResponse){

     return Observable.throw(error?.message || "server error.")
   }
  login(loginRequest: LoginRequest): Observable<User> {
     console.log(" this.auth strategy "+this.auth.stringify(this.auth));
	console.log(" this.auth URL "+JSON.stringify(config.authUrl));

     const options = {
  			  url: `${config.authUrl}/login`,
  			  headers:{ 
				'Content-Type':'application/json'
				},
   			  data: JSON.stringify(loginRequest)
 		 };
	console.log("Capacitor JLonReq " + JSON.stringify(loginRequest));
	 var postData ='';
          const response = from( async function () { 
						const r = await CapacitorHttp.post(options).then( res => {
							    console.log('capacitor response '+JSON.stringify(res));
							   if( res['status'] ==200) {
							    var data = res['data'] ;	
							    console.log('capacitor post data '+data);
          						     var output=''; 
 								postData = data;
            							return postData;
	 						    }
							    else {
							     console.log('capacitor post return failed ');
							     return res['data']; 
							     // this.errorHandler( new HttpErrorResponse({error: 'bar', status:403}));		
								}
							   } 
								);
						return r;

			  }());
          if( response!=undefined ) {
		console.log('Capacitor response  observable ready ');
		return response.pipe(tap((data) => 
     			   { 
     			   this.auth.doLoginUser(data)
    			  }),
     				 catchError(this.errorHandler) );		
		/*response.subscribe( val => {    
                     
		        if( val  !=''){ 
			   if(typeof val ==="object") {
                             console.log('Capacitor from subscribe result value object ');
			   }
			   else if( val instanceof Observable) { 
                                console.log('Capacitor from subscribe result value Observable '); 
				
			    }
			  return val;
	    	           // this.auth.doLoginUser(val )
	 	         }
		       else {
		          console.log('Capacitor failed ');
		         return this.http
      				.post<any>(`${config.authUrl}/login`, loginRequest)
     			 .pipe(tap((data) => 
     			   { 
     			   this.auth.doLoginUser(data)
    			  }),
     				 catchError(this.errorHandler)
     			 );
		        }
           	     }); // response observale subscribe end 
		*/
	  }
	  else {
	            
   		 return this.http
      				.post<any>(`${config.authUrl}/login`, loginRequest)
     			 .pipe(tap((data) => 
     			   { 
     			   this.auth.doLoginUser(data)
    			  }),
     				 catchError(this.errorHandler)
     			 );
	         
		}
  }
  loginExtGoogle(ext:string ): Observable<User> {
    console.log("Google auth Service :  ext : "+ext)
     console.log(" this.auth strategy "+JSON.stringify(this.auth));
      console.log(" config.auth "+JSON.stringify(config.auth));
      console.log(`auth url : ${config.authExtUrl}${ext}`);
      
        
    let  httpOptions = "";
    //console.log("auth login after post : data "+data)
    //debugger;
    return this.http
      .get<any>(`${config.authExtUrl}${ext}`, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
            "Authorization": "AIzaSyCjKceKN8_MGrktRW5HodmNg5jgLaFBm9s"
            })
        })
      .pipe(tap((data) =>{ 
          console.log("auth login after post : data "+data)
        this.auth.doLoginUser(data) }));
  }


  loginExt(loginRequest: LoginRequest, ext:string ): Observable<User> {
    console.log("auth Service : "+JSON.stringify(loginRequest)+" ext : "+ext)
     console.log(" this.auth strategy "+JSON.stringify(this.auth));
      console.log(" config.auth "+JSON.stringify(config.auth));
      console.log(`auth url : ${config.authExtUrl}${ext}`);

    //console.log("auth login after post : data "+data)
    //debugger;
    return this.http
      .post<any>(`${config.authExtUrl}${ext}`, loginRequest)
      .pipe(tap((data) =>{ 
          console.log("auth login after post : data "+data)
        this.auth.doLoginUser(data) }));
  }

  logout() {
   console.log("auth service logout ");
    return this.http
      .get<any>(`${config.authUrl}/logout`)
      .pipe(tap(() => this.doLogoutUser()));
  }

  isLoggedIn$(): Observable<boolean> {
    return this.auth.getCurrentUser().pipe(
      map((user) => !!user),
      catchError(() => of(false))
    );
  }

  getCurrentUser$(): Observable<User> {
    return this.auth.getCurrentUser();
  }

  getUserRole$(): Observable<string> {
    return this.auth.getCurrentUser().pipe(map((user) => user.role));
  }

  getUserEmail$(): Observable<string> {
    return this.auth.getCurrentUser().pipe(map((user) => user.email));
  }

  doLogoutAndRedirectToLogin() {
    this.doLogoutUser();
    this.router.navigate(["/login"]);
  }

  logoutAuth0() {
    return this.logout().subscribe(() => {
      window.location.href = `${auth0.url}/logout?client_id=${auth0.clientId}&returnTo=${auth0.returnUrl}`;
    });
  }

  isAuth0User(user: User): boolean {
    return user.id.startsWith("auth0");
  }

  private doLogoutUser() {
    this.cacheService.pruneAll();
    this.auth.doLogoutUser();
  }
}
