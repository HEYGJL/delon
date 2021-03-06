import { Component, EventEmitter, forwardRef, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AlainConfigService, AlainDateRangePickerShortcut, AlainDateRangePickerShortcutItem } from '@delon/util/config';
import { fixEndTimeOfRange, getTimeDistance } from '@delon/util/date-time';
import { InputBoolean } from '@delon/util/decorator';
import { deepMergeKey } from '@delon/util/other';
import { FunctionProp, NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzRangePickerComponent } from 'ng-zorro-antd/date-picker';

/**
 * @deprecated Will be removed in 12.0.0, Pls used `nz-range-picker` and `[extend]` directive instead, for examples:
 * ```html
 * <range-picker [(ngModel)]="i.start" [(ngModelEnd)]="i.end"></range-picker>
 * ```
 * Changed to =>
 * ```html
 * <nz-range-picker [(ngModel)]="i.start" extend [(ngModelEnd)]="i.end"></nz-range-picker>
 * ```
 */
@Component({
  selector: 'range-picker',
  exportAs: 'rangePicker',
  templateUrl: './range.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => RangePickerComponent),
    },
  ],
})
export class RangePickerComponent implements ControlValueAccessor {
  private onChangeFn: (val: Date) => void;
  private _shortcut: AlainDateRangePickerShortcut;
  private defaultShortcuts: AlainDateRangePickerShortcut;
  @ViewChild('comp', { static: false }) private comp: NzRangePickerComponent;
  value: Array<Date | null> = [];

  @Input() ngModelEnd: Date;
  @Input()
  set shortcut(val: AlainDateRangePickerShortcut | null) {
    const item = deepMergeKey({}, true, this.defaultShortcuts, val == null ? {} : val) as AlainDateRangePickerShortcut;
    if (typeof val === 'boolean') {
      item.enabled = val;
    }
    (item.list || []).forEach(i => {
      i._text = this.dom.bypassSecurityTrustHtml(i.text);
    });
    this._shortcut = item;
  }
  get shortcut(): AlainDateRangePickerShortcut | null {
    return this._shortcut;
  }
  @Output() readonly ngModelEndChange = new EventEmitter<Date>();

  // #region Native properties

  @Input() nzAllowClear = true;
  @Input() nzAutoFocus = false;
  @Input() nzClassName: string;
  @Input() nzDisabled: boolean;
  @Input() nzSize: string;
  @Input() nzStyle: string;
  @Input() nzDisabledDate: (d: Date) => boolean;
  @Input() nzLocale: object;
  @Input() nzPopupStyle: object;
  @Input() nzDropdownClassName: string;
  @Input() nzPlaceHolder: string | string[];
  @Output() readonly nzOnOpenChange = new EventEmitter<boolean>();

  // range
  @Input() nzDateRender: any;
  @Input() nzFormat: any;
  @Input() nzDisabledTime: any;
  @Input() nzRenderExtraFooter: FunctionProp<TemplateRef<void> | string>;
  @Input() nzShowTime: any;
  @Input() @InputBoolean() nzShowToday: boolean = true;
  @Input() nzMode: any;
  @Input() nzRanges: any;
  @Output() readonly nzOnPanelChange = new EventEmitter<any>();
  @Output() readonly nzOnOk = new EventEmitter<any>();

  // #endregion

  constructor(private dom: DomSanitizer, configSrv: AlainConfigService) {
    const cog = configSrv.merge('dataRange', {
      nzFormat: 'yyyy-MM-dd',
      nzAllowClear: true,
      nzAutoFocus: false,
      nzPopupStyle: { position: 'relative' },
      nzShowToday: true,
      shortcuts: {
        enabled: false,
        closed: true,
        list: [
          {
            text: '??????',
            fn: () => getTimeDistance('today'),
          },
          {
            text: '??????',
            fn: () => getTimeDistance('yesterday'),
          },
          {
            text: '???3???',
            fn: () => getTimeDistance(-2),
          },
          {
            text: '???7???',
            fn: () => getTimeDistance(-6),
          },
          {
            text: '??????',
            fn: () => getTimeDistance('week'),
          },
          {
            text: '??????',
            fn: () => getTimeDistance('month'),
          },
          {
            text: '??????',
            fn: () => getTimeDistance('year'),
          },
        ],
      },
    })!;
    this.defaultShortcuts = { ...cog.shortcuts } as AlainDateRangePickerShortcut;
    Object.assign(this, cog);
  }

  _nzOnOpenChange(e: any): void {
    this.nzOnOpenChange.emit(e);
  }

  _nzOnPanelChange(e: any): void {
    this.nzOnPanelChange.emit(e);
  }

  _nzOnOk(e: any): void {
    this.nzOnOk.emit(e);
  }

  valueChange(e: [Date, Date]): void {
    e = fixEndTimeOfRange(e);
    this.onChangeFn(e[0]);
    this.ngModelEnd = e[1];
    this.ngModelEndChange.emit(e[1]);
  }

  writeValue(value: Date): void {
    this.value = value && this.ngModelEnd ? [value, this.ngModelEnd] : [];
  }

  registerOnChange(fn: (val: Date) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(_fn: () => void): void {
    // this.onTouchedFn = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.nzDisabled = disabled;
  }

  clickShortcut(item: AlainDateRangePickerShortcutItem): void {
    this.value = item.fn(this.value as any);
    this.valueChange(this.value as [Date, Date]);
    if (this._shortcut.closed) {
      // tslint:disable-next-line:no-string-literal
      (this.comp as NzSafeAny)['picker'].hideOverlay();
    }
  }
}
