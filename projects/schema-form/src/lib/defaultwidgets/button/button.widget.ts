import {Component} from "@angular/core";

@Component({
    selector: 'sf-button-widget',
    template: '<button (click)="button.action($event)">{{button.label}}</button>',
    standalone: false
})
export class ButtonWidget {
  public button
  public formProperty
}
