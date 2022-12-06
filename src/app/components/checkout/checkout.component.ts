import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MyShopFormService} from "../../services/my-shop-form.service";
import {Country} from "../../common/country";
import {County} from "../../common/county";
import * as stream from "stream";
import {AppValidators} from "../../validators/app-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";
import {Customer} from "../../common/customer";
import {environment} from "../../../environments/environment";
import {PaymentInfo} from "../../common/payment-info";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: County[] = [];
  billingAddressStates: County[] = [];

  storage: Storage = sessionStorage;

  //initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  constructor(private fb: FormBuilder,
              private myShopFormService: MyShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) {
  }

  ngOnInit(): void {

    //setup Stripe payment form
    this.setupStripePaymentForm();

    //passing values from CartService
    this.reviewCartDetails();

    //read the user email
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!)

    this.checkoutFormGroup = this.fb.group({
      customer: this.fb.group({
        firstName: new FormControl('', [Validators.required,
          AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        lastName: new FormControl('', [Validators.required,
          AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        email: new FormControl(theEmail, [Validators.required,
          AppValidators.notOnlyWhitespace,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.fb.group({
        street: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        city: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        county: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespace,
          Validators.minLength(2)])
      }),
      billingAddress: this.fb.group({
        street: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        city: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        county: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespace,
          Validators.minLength(2)])
      }),
      creditCard: this.fb.group({
        /*
        cardType: new FormControl('',[Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, AppValidators.notOnlyWhitespaceTrim,
          Validators.minLength(2)]),
        cardNumber: new FormControl('',[Validators.required, Validators.pattern('[0-9 ]{19}')]),
        securityCode: new FormControl('',[Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
         */


      })
    });
    /*
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
    */

    // populate countries
    this.myShopFormService.getCountries().subscribe(
      data => {
        console.log("Data retrieved: " + JSON.stringify(data));
        this.countries = data;
      }
    );

  }

  get firstName() {
    // let con =this.checkoutFormGroup.getRawValue().customer.firstName;
    // console.log(con);

    return this.checkoutFormGroup.get('customer.firstName');
  }

  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }

  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }

  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }

  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.county');
  }

  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }

  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }

  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }

  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.county');
  }

  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }

  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }

  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }

  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }

  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

  getStates(formGroupName: string) {

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
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }

        //select first item by default
        formGroup?.get('county')?.setValue(data[0]);
      }
    );
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // fix the bug
      this.billingAddressStates = this.shippingAddressStates;
      console.log(this.checkoutFormGroup.controls['billingAddress']);

    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      // fix the bug
      this.billingAddressStates = [];

    }
  }


  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();

    const selectedYear: number = Number(creditCardFormGroup?.value['expirationYear']);

    //if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;

    } else {
      startMonth = 1;
    }

    this.myShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
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
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;


    //get cart items
    const cartItem = this.cartService.cartItems;

    //create orderItems from cartItems
    // - long way
    /*    let orderItems: OrderItem[] =[];
        for (let i=0;i<cartItem.length;i++){
          orderItems[i]= new OrderItem(cartItem[i]);
        }*/

    // - short way
    let orderItems: OrderItem[] = cartItem.map(tempCartItem => new OrderItem(tempCartItem));

    //set up purchase
    let purchase = new Purchase();


    //populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    console.log(purchase.shippingAddress);
    const shippingCounty: County = JSON.parse(JSON.stringify(purchase.shippingAddress.county));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.county = shippingCounty.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingCounty: County = JSON.parse(JSON.stringify(purchase.billingAddress.county));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.county = shippingCounty.name;
    purchase.billingAddress.country = shippingCountry.name;


    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = this.totalPrice * 100;
    this.paymentInfo.currency = "USD";

    // if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order
    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement
              }
            }, {handleActions: false})
            .then((result: any) => {
              if (result.error) {
                // inform the customer there was an error
                alert(`There was an error: ${result.error.message}`);
              } else {
                // cal REST API via the CheckoutService
                this.checkoutService.placeOrder(purchase).subscribe({
                    next: (response: any) => {
                      alert(`Your roder has beed received.\nOrder Tracking number: ${response.orderTrackingNumber}`);

                      // reset cart
                      this.resetCart();
                    },
                    error: (err: any) => {
                      alert(`There was an error: ${err.message}`);
                    }
                  })
              }
            });
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //call REST API via the CheckoutService
    /*
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received.\nOrder Tracking number: ${response.orderTrackingNumber}`);

          // reset cart
          this.resetCart();

        },
        error:  err=> {
          alert(`There was an error: ${err.message}`);
        }
      }
    );
     */


    // console.log(this.checkoutFormGroup.get('customer')?.value);
    // console.log(`Shipping address is ${this.checkoutFormGroup.get('shippingAddress')}`);
    // console.log(`Shipping address is ${this.checkoutFormGroup.get('shippingAddress')}`);
  }

  private resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.checkoutFormGroup.reset();

    //navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  private setupStripePaymentForm() {

    // get a handle to stripe elements
    var elements = this.stripe.elements();
    // Create a card element
    this.cardElement = elements.create('card', {hidePostalCode: true});
    // Add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');
    // Add event binding for the 'charge' event on the card element
    this.cardElement.on('change', (event: any) => {
      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        // show validation error to customer
        this.displayError.textContent = event.error.message;
      }

    });
  }
}
