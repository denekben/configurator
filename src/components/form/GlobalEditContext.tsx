// src/components/form/GlobalEditContext.tsx

import { createContext, useContext } from 'react';

export interface GlobalEditContextValue {
  /** Разблокирован ли блок «Глобальные данные» на текущей вкладке. */
  editable: boolean;
  /** Изменить состояние редактирования. */
  setEditable: (v: boolean) => void;
  /** Есть ли на текущей вкладке блок «Глобальные данные» (GlobalDataWrapper). */
  hasGlobalBlock: boolean;
}

const defaultValue: GlobalEditContextValue = {
  editable: true, // по умолчанию «можно редактировать» — чтобы не блокировать вкладки без обёртки
  setEditable: () => {},
  hasGlobalBlock: false,
};

export const GlobalEditContext = createContext<GlobalEditContextValue>(defaultValue);

export function useGlobalEdit() {
  return useContext(GlobalEditContext);
}