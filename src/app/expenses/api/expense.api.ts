import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
// using capacitor 
import { CapacitorHttp , HttpResponse  } from '@capacitor/core';
import { Observable , from} from "rxjs";

import { config } from "../../core/config";
import { Expense } from "@models/expense";
import { Period } from "@models/period";

@Injectable()
export class ExpenseApi {
  private readonly API_URL = `${config.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

   getExpenses(period: Period): Observable<Expense[]> {

	 const options = {
  			  url: `${this.API_URL}/?month=${period.month}&year=${period.year}`,
  			  headers: { 'X-Fake-Header': 'Fake-Value' }
   			
 		 };
          const response = from( async function () { 
						const r = await CapacitorHttp.get(options).then( res => {
							   if( res['status'] ==200) {
							    var data = res['data'] ;	
          						     var output=''; 
            							return data;
	 						    }
							    else {
							       return '';
								}
							   } 
								);
						return r;

			  }());
          if( response!=undefined ) {
	    	return response;
	  }
	  else {
   	  return this.http.get<Expense[]>(
    		  `${this.API_URL}/?month=${period.month}&year=${period.year}`
    		);
	}
  }

  filterExpenses(period: Period, category: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(
      `${this.API_URL}/?month=${period.month}&year=${period.year}&categoryName=${category}`
    );
  }

  createExpense(expense: Expense): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/`, expense);
  }

  updateExpense(expense: Expense): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${expense.id}`, expense);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
