// src/components/form/tabs/CondensateTrapTab.tsx

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import { RadioControl } from '../../controls/RadioControl';
import { GlobalDataWrapper } from '../GlobalDataWrapper';
import { ResultRow } from '../ResultRow';
import type { InputData } from '../../../core/types';
import { calcSteamFlow } from '../../../core/calc/steamPipeTabCalc';
import { getSelectedTrapCapacity } from '../../../core/calc/condensateTrapTabCalc';

const TRAP_DUS = [25, 40, 50];
const DELTA_P_OPTIONS = [0.1, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 4.5, 6, 7, 8, 9, 10, 12, 14];
const TRAP_TYPES = [4.5, 10, 14];

const RESERVE_MIN = 2;
const RESERVE_MAX = 3;
const REQUIRED_MSG = 'Обязательное поле';
const NEGATIVE_MSG = 'Значение не может быть отрицательным';
const MODE_REQUIRED_MSG = 'Выберите режим подбора';

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function CondensateTrapTab() {
  const { control, setValue, watch } = useFormContext<InputData>();

  const tabModeRaw = useWatch({ control, name: 'condensateTrap.mode' });
  const tabMode = tabModeRaw ?? '';
  const modeEmpty = tabMode === '';
  const isManual = tabMode === 'manual';

  const loadKwInput = useWatch({ control, name: 'system.loadKw' });
  const enthalpySteamInput = useWatch({ control, name: 'steamThermo.enthalpySteam' });
  const enthalpyCondensateInput = useWatch({ control, name: 'steamThermo.enthalpyCondensate' });
  const steamPressureInput = useWatch({ control, name: 'steamFlow.steamPressureBar' });
  const condensatePressureInput = useWatch({ control, name: 'steamFlow.condensateLinePressureBar' });
  const trapReserveFactorInput = useWatch({ control, name: 'condensateTrap.trapReserveFactor' });

  // Пользовательский выбор (управляется ТОЛЬКО через onChange в Select)
  const selectedDu = watch('results.trapDu');
  const selectedDeltaP = watch('results.trapDesignDeltaP');
  const selectedTrapType = watch('results.trapTypeDeltaP');

  // 1. Приведение к числам
  const loadKw = toNumberOrNull(loadKwInput);
  const enthalpySteam = toNumberOrNull(enthalpySteamInput);
  const enthalpyCondensate = toNumberOrNull(enthalpyCondensateInput);
  const steamPressure = toNumberOrNull(steamPressureInput);
  const condensatePressure = toNumberOrNull(condensatePressureInput);
  const trapReserveFactor = toNumberOrNull(trapReserveFactorInput);

  const designDeltaPNum = toNumberOrNull(selectedDeltaP);
  const selectedTrapTypeNum = toNumberOrNull(selectedTrapType);
  const selectedDuNum = toNumberOrNull(selectedDu);

  // 2. Валидация обязательности
  const loadKwEmpty = loadKw === null;
  const enthalpySteamEmpty = enthalpySteam === null;
  const enthalpyCondensateEmpty = enthalpyCondensate === null;
  const steamPressureEmpty = steamPressure === null;
  const condensatePressureEmpty = condensatePressure === null;
  const reserveEmpty = trapReserveFactor === null;

  // 2a. Валидация отрицательных значений
  const loadKwNegative = loadKw !== null && loadKw < 0;
  const enthalpySteamNegative = enthalpySteam !== null && enthalpySteam < 0;
  const enthalpyCondensateNegative = enthalpyCondensate !== null && enthalpyCondensate < 0;
  const steamPressureNegative = steamPressure !== null && steamPressure < 0;
  const condensatePressureNegative = condensatePressure !== null && condensatePressure < 0;
  const reserveNegative = trapReserveFactor !== null && trapReserveFactor < 0;

  // 3. Валидация диапазона запаса 2–3
  const reserveOutOfRange =
    !reserveEmpty && !reserveNegative &&
    (trapReserveFactor < RESERVE_MIN || trapReserveFactor > RESERVE_MAX);

  // 4. Есть ли ошибки во входных полях
  const hasInputErrors =
    modeEmpty ||
    loadKwEmpty || loadKwNegative ||
    enthalpySteamEmpty || enthalpySteamNegative ||
    enthalpyCondensateEmpty || enthalpyCondensateNegative ||
    steamPressureEmpty || steamPressureNegative ||
    condensatePressureEmpty || condensatePressureNegative ||
    reserveEmpty || reserveNegative || reserveOutOfRange;

  const canCalc = !hasInputErrors;

  // 5. Ручной режим: обязательные селекты
  const duMissing = isManual && selectedDuNum === null;
  const deltaPMissing = isManual && designDeltaPNum === null;
  const trapTypeMissing = isManual && selectedTrapTypeNum === null;

  // 6. Расчёты (только когда нет ошибок ввода)
  const steamFlow =
    canCalc && loadKw !== null && enthalpySteam !== null && enthalpyCondensate !== null
      ? calcSteamFlow(loadKw, enthalpySteam, enthalpyCondensate)
      : 0;

  const deltaP =
    canCalc && steamPressure !== null && condensatePressure !== null
      ? Math.max(steamPressure - condensatePressure, 0)
      : 0;

  const requiredFlow =
    canCalc && steamFlow && trapReserveFactor
      ? steamFlow * trapReserveFactor
      : 0;

  // 7. Итоговая пропускная способность для выбранного Ду/типа/перепада
  const finalCapacity =
    isManual &&
    selectedDuNum !== null &&
    designDeltaPNum !== null &&
    selectedTrapTypeNum !== null
      ? getSelectedTrapCapacity(selectedDuNum, designDeltaPNum, selectedTrapTypeNum)
      : null;

  // 8. Проверка достаточности
  const isSufficient = finalCapacity !== null && finalCapacity >= requiredFlow;

  // 9. Выбран тип, но пропускной способности нет (в таблице «—»)
  const capacityMissing =
    isManual &&
    selectedDuNum !== null &&
    designDeltaPNum !== null &&
    selectedTrapTypeNum !== null &&
    finalCapacity === null;

  // 10. Сохранение ТОЛЬКО вычисляемых результатов
  useEffect(() => {
    if (!canCalc) {
      setValue('results.trapSteamFlowKgH', undefined);
      setValue('results.trapReserveFactor', undefined);
      setValue('results.trapDeltaP', undefined);
      setValue('results.trapRequiredFlowKgH', undefined);
      setValue('results.trapActualCapacityKgH', undefined);
      setValue('results.trapIsSufficient', undefined);
      return;
    }

    setValue('results.trapSteamFlowKgH', steamFlow);
    setValue('results.trapReserveFactor', trapReserveFactor ?? undefined);
    setValue('results.trapDeltaP', deltaP);
    setValue('results.trapRequiredFlowKgH', requiredFlow);
    setValue('results.trapActualCapacityKgH', finalCapacity ?? undefined);
    setValue('results.trapIsSufficient', isSufficient);
  }, [
    canCalc,
    steamFlow,
    trapReserveFactor,
    deltaP,
    requiredFlow,
    finalCapacity,
    isSufficient,
    setValue,
  ]);

  // 11. Генерация LaTeX
  const flowFormula =
    steamFlow > 0
      ? `G = \\frac{${loadKw} \\cdot 3600}{${enthalpySteam} - ${enthalpyCondensate}} \\cdot 0.99 = ${steamFlow.toFixed(6)}`
      : '';

  const deltaPFormula =
    deltaP > 0
      ? `\\Delta P = ${steamPressure} - ${condensatePressure} = ${deltaP.toFixed(6)}`
      : '';

  const requiredFlowFormula =
    requiredFlow > 0
      ? `G_{тр} = ${steamFlow.toFixed(6)} \\cdot ${trapReserveFactor} = ${requiredFlow.toFixed(6)}`
      : '';

  // Стиль для helper-подписей
  const helperSx = {
    mx: 1.75,
    mt: 0.5,
    color: 'error.main',
  } as const;

  // Хелпер приоритета: пусто → отрицательное → диапазон
  const buildHelper = (
    empty: boolean,
    negative: boolean,
    rangeMsg?: string,
  ): string | undefined => {
    if (empty) return REQUIRED_MSG;
    if (negative) return NEGATIVE_MSG;
    return rangeMsg;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
        <RadioControl
          name="condensateTrap.mode"
          label="Режим подбора"
          control={control}
          options={[
            { value: 'auto', label: 'Автоматический' },
            { value: 'manual', label: 'Ручной' },
          ]}
          error={modeEmpty}
          helperText={modeEmpty ? MODE_REQUIRED_MSG : undefined}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <GlobalDataWrapper>
        <SectionCard title="Данные по системам">
          <TextControl
            name="system.loadKw"
            label="Мощность, кВт"
            control={control}
            type="number"
            error={loadKwEmpty || loadKwNegative}
            helperText={buildHelper(loadKwEmpty, loadKwNegative)}
          />
        </SectionCard>
        <SectionCard title="Данные по пару в первичном контуре">
          <TextControl
            name="steamFlow.steamPressureBar"
            label="Давление пара, Бар (и)"
            control={control}
            type="number"
            error={steamPressureEmpty || steamPressureNegative}
            helperText={buildHelper(steamPressureEmpty, steamPressureNegative)}
          />
          <TextControl
            name="steamFlow.condensateLinePressureBar"
            label="Давление в конденсатной линии, Бар (и)"
            control={control}
            type="number"
            error={condensatePressureEmpty || condensatePressureNegative}
            helperText={buildHelper(condensatePressureEmpty, condensatePressureNegative)}
          />
        </SectionCard>
        <SectionCard title="Данные по параметрам пара">
          <TextControl
            name="steamThermo.enthalpySteam"
            label="Энтальпия пара, кДж/кг"
            control={control}
            type="number"
            error={enthalpySteamEmpty || enthalpySteamNegative}
            helperText={buildHelper(enthalpySteamEmpty, enthalpySteamNegative)}
          />
          <TextControl
            name="steamThermo.enthalpyCondensate"
            label="Энтальпия конденсата, кДж/кг"
            control={control}
            type="number"
            error={enthalpyCondensateEmpty || enthalpyCondensateNegative}
            helperText={buildHelper(enthalpyCondensateEmpty, enthalpyCondensateNegative)}
          />
        </SectionCard>
      </GlobalDataWrapper>

      <SectionCard title="Дополнительные параметры Конденсатоотводчика">
        <TextControl
          name="condensateTrap.trapReserveFactor"
          label={`Запас на расход (${RESERVE_MIN}-${RESERVE_MAX})`}
          control={control}
          type="number"
          error={reserveEmpty || reserveNegative || reserveOutOfRange}
          helperText={buildHelper(
            reserveEmpty,
            reserveNegative,
            reserveOutOfRange
              ? `Вне диапазона ${RESERVE_MIN}–${RESERVE_MAX} (сейчас ${trapReserveFactor?.toFixed(6)}).`
              : undefined,
          )}
        />
      </SectionCard>

      {canCalc && isManual && (
        <>
          <Divider sx={{ my: 4, borderBottomWidth: 2, borderColor: '#8B0000' }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Результаты расчёта
            </Typography>

            {/* 1. Расход пара */}
            <ResultRow
              label="Расход пара"
              value={steamFlow.toFixed(6)}
              unit="кг/ч"
              latexFormulaWithNumbers={flowFormula}
            />

            {/* 2. Перепад давления */}
            <ResultRow
              label="Перепад давления"
              value={deltaP.toFixed(6)}
              unit="бар"
              latexFormulaWithNumbers={deltaPFormula}
            />

            {/* 3. Расход для конденсатоотводчика */}
            <ResultRow
              label="Расход для конденсатоотводчика"
              value={requiredFlow.toFixed(6)}
              unit="кг/ч"
              latexFormulaWithNumbers={requiredFlowFormula}
            />

            {/* 4. Выбор расчётного перепада */}
            <FormControl
              fullWidth
              size="small"
              error={deltaPMissing}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              <InputLabel>Выбор расчётного перепада (бар)</InputLabel>
              <Select
                value={selectedDeltaP ?? ''}
                label="Выбор расчётного перепада (бар)"
                onChange={(e) => {
                  const v = String(e.target.value);
                  setValue('results.trapDesignDeltaP', v === '' ? undefined : Number(v));
                }}
              >
                {DELTA_P_OPTIONS.map((dp) => (
                  <MenuItem key={dp} value={dp}>
                    {dp}
                  </MenuItem>
                ))}
              </Select>
              {deltaPMissing && (
                <FormHelperText sx={helperSx}>{REQUIRED_MSG}</FormHelperText>
              )}
            </FormControl>

            {/* 5. Давление пара */}
            {selectedDeltaP && (
              <ResultRow
                label="Давление пара"
                value={steamPressure !== null ? steamPressure.toFixed(6) : '—'}
                unit="бар"
              />
            )}

            {/* 6 + 7. Выбор перепада конденсатоотводчика и выбор Ду — в одну строку */}
            {designDeltaPNum !== null && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                  mb: 3,
                }}
              >
                <FormControl
                  fullWidth
                  size="small"
                  error={trapTypeMissing || capacityMissing}
                  variant="outlined"
                >
                  <InputLabel>Выбор перепада конденсатоотводчика (бар)</InputLabel>
                  <Select
                    value={selectedTrapType ?? ''}
                    label="Выбор перепада конденсатоотводчика (бар)"
                    onChange={(e) => {
                      const v = String(e.target.value);
                      setValue('results.trapTypeDeltaP', v === '' ? undefined : Number(v));
                    }}
                  >
                    {TRAP_TYPES.map((dp) => (
                      <MenuItem key={dp} value={dp}>
                        {dp}
                      </MenuItem>
                    ))}
                  </Select>

                  {trapTypeMissing && (
                    <FormHelperText sx={helperSx}>{REQUIRED_MSG}</FormHelperText>
                  )}

                  {capacityMissing && (
                    <FormHelperText sx={helperSx}>
                      Для Ду {selectedDu} мм, расчётного перепада {selectedDeltaP} бар и типа{' '}
                      {selectedTrapType} бар пропускной способности нет.
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  size="small"
                  error={duMissing || capacityMissing}
                  variant="outlined"
                >
                  <InputLabel>Выбор Ду (мм)</InputLabel>
                  <Select
                    value={selectedDu ?? ''}
                    label="Выбор Ду (мм)"
                    onChange={(e) => {
                      const v = String(e.target.value);
                      setValue('results.trapDu', v === '' ? undefined : Number(v));
                    }}
                  >
                    {TRAP_DUS.map((du) => (
                      <MenuItem key={du} value={du}>
                        {du}
                      </MenuItem>
                    ))}
                  </Select>
                  {duMissing && (
                    <FormHelperText sx={helperSx}>{REQUIRED_MSG}</FormHelperText>
                  )}
                  {capacityMissing && (
                    <FormHelperText sx={helperSx}>
                      Для Ду {selectedDu} мм, расчётного перепада {selectedDeltaP} бар и типа{' '}
                      {selectedTrapType} бар пропускной способности нет.
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
            )}

            {/* 8. Табличка «Ду × Тип» с подсветкой строки выбранного типа и столбца выбранного Ду */}
            {designDeltaPNum !== null && (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Тип (перепад)</TableCell>
                      {TRAP_DUS.map((du) => {
                        const isDuSelected = selectedDuNum !== null && du === selectedDuNum;
                        return (
                          <TableCell
                            key={du}
                            align="right"
                            sx={
                              isDuSelected
                                ? { fontWeight: 'bold', bgcolor: '#fdecea' }
                                : { fontWeight: 'bold' }
                            }
                          >
                            Ду {du}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {TRAP_TYPES.map((type) => {
                      const isTypeSelected =
                        selectedTrapTypeNum !== null && type === selectedTrapTypeNum;
                      return (
                        <TableRow
                          key={type}
                          sx={
                            isTypeSelected
                              ? {
                                  bgcolor: '#fdecea',
                                  '& td': { fontWeight: 'bold' },
                                }
                              : undefined
                          }
                        >
                          <TableCell>{type} бар</TableCell>
                          {TRAP_DUS.map((du) => {
                            const isDuSelected =
                              selectedDuNum !== null && du === selectedDuNum;
                            const capacity = getSelectedTrapCapacity(
                              du,
                              designDeltaPNum,
                              type,
                            );
                            return (
                              <TableCell
                                key={du}
                                align="right"
                                sx={
                                  isDuSelected
                                    ? { bgcolor: '#fdecea', fontWeight: 'bold' }
                                    : undefined
                                }
                              >
                                {capacity !== null ? capacity : '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* 9. Итог по выбранному Ду + проверка достаточности */}
            {!capacityMissing &&
              designDeltaPNum !== null &&
              selectedTrapTypeNum !== null &&
              selectedTrapType && (
                <>
                  {finalCapacity !== null && (
                    <>
                      <ResultRow
                        label={`Пропускная способность при перепаде ${selectedTrapType} бар (расчётный ${selectedDeltaP} бар) и Ду ${selectedDu}`}
                        value={finalCapacity.toString()}
                        unit="кг/ч"
                      />

                      {!isSufficient && (
                        <FormHelperText error sx={helperSx}>
                          Пропускная способность {finalCapacity} кг/ч меньше требуемой{' '}
                          {requiredFlow.toFixed(6)} кг/ч.
                        </FormHelperText>
                      )}
                    </>
                  )}
                </>
              )}
          </Box>
        </>
      )}

      {!isManual && !modeEmpty && (
        <Box
          sx={{
            mt: 4,
            p: 4,
            textAlign: 'center',
            bgcolor: '#fafafa',
            borderRadius: 2,
            border: '1px dashed #ccc',
          }}
        >
          <Typography color="text.secondary">
            В автоматическом режиме параметры конденсатоотводчика подбираются автоматически.
          </Typography>
        </Box>
      )}
    </Box>
  );
}