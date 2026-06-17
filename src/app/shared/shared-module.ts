import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material-module';

// Services
import { UtilsService } from './utils';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  imports: [CommonModule, MaterialModule,ReactiveFormsModule],
  exports: [CommonModule, MaterialModule,ReactiveFormsModule],
  providers:[UtilsService]
})
export class SharedModule { }
