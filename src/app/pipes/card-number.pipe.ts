import {Pipe, PipeTransform} from '@angular/core';
import {count} from "rxjs";

@Pipe({
  name: 'creditCardNumberP'
})
export class CardNumberPipe implements PipeTransform {
  result: string = "";
  transform(value: string) {

      return this.blockSplit(value.replace(/\s/g, ''),4, " ");

    }
  blockSplit(input: string, blockSize: number, splitValue: string){
    let output = "";
    for(let i = 0; i < input.length; i += blockSize){
      if(output !== ""){
        output += splitValue + input.substring(i, i + blockSize);
      }
      else{
        output = input.substring(0, blockSize);
      }
    }
    return output;
  }

}
