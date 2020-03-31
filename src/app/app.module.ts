import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { DrawableDirective } from './directives/drawable.directive';

@NgModule({
  imports: [BrowserModule, CommonModule, FormsModule],
  declarations: [AppComponent, DrawableDirective],
  bootstrap: [AppComponent]
})
export class AppModule {}
