import { Component } from '@angular/core';

import { ControlWidget } from '../../widget';

@Component({
    selector: 'sf-string-widget',
    template: `<input *ngIf="this.schema.widget.id ==='hidden'; else notHiddenFieldBlock"
  [attr.name]="name" type="hidden" [formControl]="control">
<ng-template #notHiddenFieldBlock>
<div class="widget form-group">
    <label *ngIf="schema.title" [attr.for]="id" class="horizontal control-label">
    	{{ schema.title }}
    </label>
    <span *ngIf="schema.description" class="formHelp">{{schema.description}}</span>
    <input [name]="name" [attr.readonly]="(schema.widget.id!=='color') && schema.readOnly?true:null"
    class="text-widget.id textline-widget form-control"
    [attr.type]="!this.schema.widget.id || this.schema.widget.id === 'string' ? 'text' : this.schema.widget.id"
    [attr.id]="id"  [formControl]="control" [attr.placeholder]="schema.placeholder"
    [attr.maxLength]="schema.maxLength || null"
    [attr.minLength]="schema.minLength || null"
    [attr.required]="schema.isRequired || null"
	[disableControl]="(schema.widget.id=='color' && schema.readOnly)?true:null">
    <input *ngIf="(schema.widget.id==='color' && schema.readOnly)" [attr.name]="name" type="hidden" [formControl]="control">
</div>
</ng-template>`,
    standalone: false
})
export class StringWidget extends ControlWidget {

    getInputType() {
        if (!this.schema.widget.id || this.schema.widget.id === 'string') {
            return 'text';
        } else {
            return this.schema.widget.id;
        }
    }
}
