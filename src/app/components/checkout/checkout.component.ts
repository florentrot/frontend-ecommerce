import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MyShopFormService} from "../../services/my-shop-form.service";
import {Country} from "../../common/country";
import {County} from "../../common/county";
import * as stream from "stream";
import {AppValidators} from "../../validators/app-validators";
import {CartService} from "../../services/cart.service";

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
              private myShopFormService: MyShopFormService,
              private cartService: CartService) {
  }

  ngOnInit(): void {

    this.checkoutFormGroup = this.fb.group({
      customer: this.fb.group({
        firstName: new FormControl('', [Validators.required,
                                                          AppValidators.notOnlyWhitespaceTrim,
                                                          Validators.minLength(2)]),
        lastName: new FormControl('', [Validators.required,
                                                          AppValidators.notOnlyWhitespaceTrim,
                                                          Validators.minLength(2)]),
        email: new FormControl('', [Validators.required,
                                                      AppValidators.notOnlyWhitespace,
                                                      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.fb.group({
        street: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
                                                        Validators.minLength(2)]),
        city: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
                                                        Validators.minLength(2)]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespace,
                                                        Validators.minLength(2)])
      }),
      billingAddress: this.fb.group({
        street: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        city: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespace,
          Validators.minLength(2)])
      }),
      creditCard: this.fb.group({
        cardType: new FormControl('',[Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        cardNumber: new FormControl('',[Validators.required, Validators.pattern('[0-9 ]{19}')]),
        securityCode: new FormControl('',[Validators.required, Validators.pattern('[0-9]{3}')]),
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
  //passing values from CartService
  this.reviewCartDetails();

  }

  get firstName() {return this.checkoutFormGroup.get('customer.firstName');}
  get lastName() {return this.checkoutFormGroup.get('customer.lastName');}
  get email() {return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet() {return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity() {return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState() {return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressCountry() {return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressZipCode() {return this.checkoutFormGroup.get('shippingAddress.zipCode');}

  get billingAddressStreet() {return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity() {return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressState() {return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressCountry() {return this.checkoutFormGroup.get('billingAddress.country');}
  get billingAddressZipCode() {return this.checkoutFormGroup.get('billingAddress.zipCode');}

  get creditCardType() {return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard() {return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber() {return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode() {return this.checkoutFormGroup.get('creditCard.securityCode');}

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

  private reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  onSubmit() {
    console.log("clicked submit");
    if(this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get('customer')?.value);

    console.log(`Shipping address is ${this.checkoutFormGroup.get('shippingAddress')}`);
    console.log(`Shipping addres is ${this.checkoutFormGroup.get('shippingAddress')}`);
  }

}
