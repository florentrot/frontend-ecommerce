import {AbstractControl, FormControl, ValidationErrors} from "@angular/forms";

export class AppValidators {

  static notOnlyWhitespace(control: AbstractControl) : ValidationErrors | null {

    // if((control.valid!=null) && (control.value.trim().length ===0)) {
    //
    //   return {'notOnlyWhitespace': true};
    // } else {
    //   return null;
    // }

    if ((control.value as string)?.indexOf(' ') != -1) {
      return { 'notOnlyWhitespace': true };
    }
    return null;

  }

  static notOnlyWhitespaceTrim(control: AbstractControl) : ValidationErrors | null {

    if((control.valid!=null) && (control?.value?.trim()?.length ===0)) {

      return {'notOnlyWhitespaceTrim': true};
    } else {
      return null;
    }



  }
}
