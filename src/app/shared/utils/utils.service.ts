import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import moment from 'moment'
@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  getErrorField(form: FormGroup, key: string) {
    const errors = Object.keys(form.get(key)?.errors || {});
    if (errors.length === 0)
      return null;
    let message: string = '';
    for (const error of errors) {
      switch (error) {
        case 'required':
          message = `The ${this.transformReadableString(key)} field  is required`
          break

        case 'pattern':
          message = `The ${this.transformReadableString(key)} is invalid`
          break

        default:
          break;
      }
    }

    return message;
  }

  formatDateStandart(date:Date){
    return moment(date).format('MM/DD/YY')
  }

  formatDateTime(date:Date){
    return moment(date).format('MM/DD/YY hh:mm a')
  }

  isValidField(form: FormGroup, key: string) {
    return form.get(key)?.invalid && form.get(key)?.touched;
  }

  private transformReadableString(phrase: string) {
    return phrase.split('_')
      .map(word => word.charAt(0) + word.slice(1))
      .join(' ');
  }

  public static readonly emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
}
