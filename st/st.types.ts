import { TemplateRef } from '@angular/core';
import { STColumn, STColumnButton, STColumnSafeType, STData, STSortMap } from './st.interfaces';
import { SafeHtml } from "@angular/platform-browser";

// tslint:disable-next-line: class-name
export interface _STColumn extends STColumn {
  children?: _STColumn[];

  indexKey?: string;
  /**
   * 是否有子列
   */
  hasSubColumns?: boolean;
  /**
   * 是否需要截短行为
   * - `type: 'img'` 强制非必要
   */
  _isTruncate?: boolean;
  /**
   * 校验需要未自定义 `className` 时应检查 `_isTruncate` 是否需要截短行为
   */
  _className?: string | string[] | Set<string> | { [klass: string]: any } | null;
  _sort?: STSortMap;
  _left?: string;
  _right?: string;
  __point?: number;
  __renderTitle?: TemplateRef<void>;
  __render?: TemplateRef<void>;

  column?: _STColumn;
}
/**
 * @inner
 */
export interface _STColumnButton<T extends STData = any> extends STColumnButton<T> {
  _text?: string;
  children?: Array<_STColumnButton<T>>;
}
export interface _STDataValue {
  text: string;
  _text: SafeHtml;
  org?: any;
  color?: string;
  safeType: STColumnSafeType;
  buttons?: _STColumnButton[];
}
