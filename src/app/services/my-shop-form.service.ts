import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Country} from "../common/country";
import {map} from "rxjs/operators";
import {County} from "../common/county";
import {Order} from "../common/order";

@Injectable({
  providedIn: 'root'
})
export class MyShopFormService {

  private countriesUrl = 'http://localhost:8080/api/countries';
  private countiesUrl = 'http://localhost:8080/api/counties';

  constructor(private httpClient: HttpClient) { }

  getCountries():Observable<Country[]> {
   return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
   );
  }

  getCounties(theCountryCode: string):Observable<County[]> {
    const searchCountyUrl = `${this.countiesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseCounties>(searchCountyUrl).pipe(
      map(response => response._embedded.counties)
    );
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {

    let data: number[] =[];

    for (let theMonth = startMonth; theMonth<=12;theMonth++) {
      data.push(theMonth);
    }

    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {

    let data: number[] =[];
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear+10;

    for (let theYear = startYear; theYear<=endYear;theYear++) {
      data.push(theYear);
    }

    return of(data);
  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}

interface GetResponseCounties {
  _embedded: {
    counties: County[];
  }
}
