import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MyShopFormService} from "../../services/my-shop-form.service";
import {Country} from "../../common/country";
import {County} from "../../common/county";
import * as stream from "stream";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number =0;
  totalQuantity: number =0;

  creditCardYears: number[] =[];
  creditCardMonths: number[] =[];

  countries: Country[] =[];
  shippingAddressStates: County[]=[];
  billingAddressStates: County[]=[];

  constructor(private fb: FormBuilder,
              private myShopFormService: MyShopFormService) {
  }

  ngOnInit(): void {

    this.checkoutFormGroup = this.fb.group({
      customer: this.fb.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      billingAddress: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.fb.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    //populate credit card months
    const startMonth: number = new Date().getMonth() + 1;

    this.myShopFormService.getCreditCardMonths(startMonth).subscribe(
      data=> {
        this.creditCardMonths = data;
      }
    )

    // populate credit card years
    this.myShopFormService.getCreditCardYears().subscribe(
      data=> {
        this.creditCardYears = data;
      }
    );


   // populate countries
    this.myShopFormService.getCountries().subscribe(
      data => {
        console.log("Data retrieved: " + JSON.stringify(data));
        this.countries =data;
      }
    );

  }

  getStates(formGroupName: string){

    const formGroup = this.checkoutFormGroup.get(formGroupName);
    console.log("------------------");
    console.log(formGroup);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;
    console.log("country code " + countryCode);
    console.log("country code " + countryName);

    //populate countries
    this.myShopFormService.getCounties(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates =data;
        }

        //select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // fix the bug
      this.billingAddressStates=this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      // fix the bug
      this.billingAddressStates =[];
    }
  }


  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();

    const selectedYear: number = Number(creditCardFormGroup?.value['expirationYear']);

    //if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if(currentYear === selectedYear) {
      startMonth = new Date().getMonth() +1;

    } else {
      startMonth =1;
    }

    this.myShopFormService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        this.creditCardMonths=data;
      }
    )

  }

  onSubmit() {
    console.log("clicked submit");
    console.log(this.checkoutFormGroup.get('customer')?.value);

    console.log("The shipping country is " + this.checkoutFormGroup.get('shippingAddress'));
    console.log("The shipping state is " + this.checkoutFormGroup.get('shippingAddress'));
  }



}
