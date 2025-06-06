import { Component } from '@angular/core';

import { ControlWidget } from '../../widget';

@Component({
    selector: 'sf-range-widget',
    template: `<div class="widget form-group">
	<label *ngIf="schema.title" [attr.for]="id" class="horizontal control-label">
		{{ schema.title }}
	</label>
    <span *ngIf="schema.description" class="formHelp">{{schema.description}}</span>	
	<input [name]="name" class="text-widget range-widget" [attr.id]="id"
	[formControl]="control" [attr.type]="'range'" [attr.min]="schema.minimum" [attr.max]="schema.maximum" [disableControl]="schema.readOnly?true:null" >
	<input *ngIf="schema.readOnly" [attr.name]="name" type="hidden">
</div>`,
    standalone: false
})
export class RangeWidget extends ControlWidget {}
