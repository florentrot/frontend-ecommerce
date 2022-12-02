import { Injectable } from '@angular/core';
import {CartItem} from "../common/cart-item";
import {BehaviorSubject, Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] =[];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0)
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0)

  constructor() { }

  addToCart(theCartItem: CartItem) {
  //check if I have this item in my cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined!;

    if(this.cartItems.length>0) {

      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id)!;

      //check if we found it
      alreadyExistsInCart=(existingCartItem!=undefined);
    }
    if(alreadyExistsInCart) {
      existingCartItem.quantity++;
    } else {
      this.cartItems.push(theCartItem);
    }
    // compute cart total price and total quantity
    this.computeCartTotals();
  }

  public computeCartTotals() {
    let totalPriceValue: number=0;
    let totalQuantityValue:number =0;

    for(let currentCartItem of this.cartItems){
      totalPriceValue+=currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue+=currentCartItem.quantity;
    }

    //publish the new values
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log for testing
    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  private logCartData(totalPriceValue: number, totalQuantityValue: number) {
    for(let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }

    console.log(`total price= ${totalPriceValue.toFixed(2)}; total quantity= ${totalQuantityValue}`);
    console.log("----------------------");
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if(theCartItem.quantity===0){
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }

  public remove(theCartItem: CartItem) {
    // get index of it in the array
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id);

    if(itemIndex>-1){
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }
}

