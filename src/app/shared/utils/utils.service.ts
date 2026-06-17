import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

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
          message = `The ${key} field  is required`
          break

        case 'pattern':
          message = `The ${key} is invalid`
          break

        default:
          break;
      }
    }

    return message;
  }
  isValidField(form: FormGroup, key: string) {
    return form.get(key)?.invalid && form.get(key)?.touched;
  }
  public static readonly emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
}
