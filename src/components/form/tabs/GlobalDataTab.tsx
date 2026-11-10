// src/components/form/tabs/GlobalDataTab.tsx

import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Typography, Divider } from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import { SelectControl } from '../../controls/SelectControl';
import { GlobalDataWrapper } from '../GlobalDataWrapper';
import type { InputData } from '../../../core/types';

const REQUIRED_MSG = 'Обязательное поле';
const NEGATIVE_MSG = 'Значение не может быть отрицательным';

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function isEmptyString(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

export function GlobalDataTab() {
  const { control } = useFormContext<InputData>();

  // Пар в первичном контуре
  const steamTempC = useWatch({ control, name: 'steamFlow.steamTempC' });
  const steamPressureBar = useWatch({ control, name: 'steamFlow.steamPressureBar' });
  const condensateTempC = useWatch({ control, name: 'steamFlow.condensateTempC' });
  const condensateLinePressureBar = useWatch({ control, name: 'steamFlow.condensateLinePressureBar' });

  // Параметры пара
  const enthalpySteam = useWatch({ control, name: 'steamThermo.enthalpySteam' });
  const enthalpyCondensate = useWatch({ control, name: 'steamThermo.enthalpyCondensate' });
  const specificVolumeSteam = useWatch({ control, name: 'steamThermo.specificVolumeSteam' });
  const specificVolumeAfterValve = useWatch({ control, name: 'steamThermo.specificVolumeAfterValve' });

  // Системы
  const loadKw = useWatch({ control, name: 'system.loadKw' });
  const supplyTempC = useWatch({ control, name: 'system.supplyTempC' });
  const returnTempC = useWatch({ control, name: 'system.returnTempC' });
  const hydraulicLossM = useWatch({ control, name: 'system.hydraulicLossM' });
  const staticPressureM = useWatch({ control, name: 'system.staticPressureM' });
  const designPressureBar = useWatch({ control, name: 'system.designPressureBar' });

  // Приведение к числам
  const steamTempCNum = toNumberOrNull(steamTempC);
  const steamPressureBarNum = toNumberOrNull(steamPressureBar);
  const condensateTempCNum = toNumberOrNull(condensateTempC);
  const condensateLinePressureBarNum = toNumberOrNull(condensateLinePressureBar);

  const enthalpySteamNum = toNumberOrNull(enthalpySteam);
  const enthalpyCondensateNum = toNumberOrNull(enthalpyCondensate);
  const specificVolumeSteamNum = toNumberOrNull(specificVolumeSteam);
  const specificVolumeAfterValveNum = toNumberOrNull(specificVolumeAfterValve);

  const loadKwNum = toNumberOrNull(loadKw);
  const supplyTempCNum = toNumberOrNull(supplyTempC);
  const returnTempCNum = toNumberOrNull(returnTempC);
  const hydraulicLossMNum = toNumberOrNull(hydraulicLossM);
  const staticPressureMNum = toNumberOrNull(staticPressureM);

  // Валидация обязательности (все, кроме «Объём системы (если есть)»)
  const steamTempCEmpty = steamTempCNum === null;
  const steamPressureBarEmpty = steamPressureBarNum === null;
  const condensateTempCEmpty = condensateTempCNum === null;
  const condensateLinePressureBarEmpty = condensateLinePressureBarNum === null;

  const enthalpySteamEmpty = enthalpySteamNum === null;
  const enthalpyCondensateEmpty = enthalpyCondensateNum === null;
  const specificVolumeSteamEmpty = specificVolumeSteamNum === null;
  const specificVolumeAfterValveEmpty = specificVolumeAfterValveNum === null;

  const loadKwEmpty = loadKwNum === null;
  const supplyTempCEmpty = supplyTempCNum === null;
  const returnTempCEmpty = returnTempCNum === null;
  const hydraulicLossMEmpty = hydraulicLossMNum === null;
  const staticPressureMEmpty = staticPressureMNum === null;
  const designPressureBarEmpty = isEmptyString(designPressureBar);

  // Валидация отрицательных значений
  const steamTempCNegative = steamTempCNum !== null && steamTempCNum < 0;
  const steamPressureBarNegative = steamPressureBarNum !== null && steamPressureBarNum < 0;
  const condensateTempCNegative = condensateTempCNum !== null && condensateTempCNum < 0;
  const condensateLinePressureBarNegative = condensateLinePressureBarNum !== null && condensateLinePressureBarNum < 0;

  const enthalpySteamNegative = enthalpySteamNum !== null && enthalpySteamNum < 0;
  const enthalpyCondensateNegative = enthalpyCondensateNum !== null && enthalpyCondensateNum < 0;
  const specificVolumeSteamNegative = specificVolumeSteamNum !== null && specificVolumeSteamNum < 0;
  const specificVolumeAfterValveNegative = specificVolumeAfterValveNum !== null && specificVolumeAfterValveNum < 0;

  const loadKwNegative = loadKwNum !== null && loadKwNum < 0;
  const supplyTempCNegative = supplyTempCNum !== null && supplyTempCNum < 0;
  const returnTempCNegative = returnTempCNum !== null && returnTempCNum < 0;
  const hydraulicLossMNegative = hydraulicLossMNum !== null && hydraulicLossMNum < 0;
  const staticPressureMNegative = staticPressureMNum !== null && staticPressureMNum < 0;

  // Хелпер: приоритет сообщений «пусто» → «отрицательное»
  const buildHelper = (empty: boolean, negative: boolean): string | undefined =>
    empty ? REQUIRED_MSG : negative ? NEGATIVE_MSG : undefined;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Эти данные используются во всех расчётах. Изменения здесь применятся везде.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <SectionCard title="Данные по пару в первичном контуре">
        <TextControl
          name="steamFlow.steamTempC"
          label="Температура пара, °C"
          control={control}
          type="number"
          error={steamTempCEmpty || steamTempCNegative}
          helperText={buildHelper(steamTempCEmpty, steamTempCNegative)}
        />
        <TextControl
          name="steamFlow.steamPressureBar"
          label="Давление пара, Бар (и)"
          control={control}
          type="number"
          error={steamPressureBarEmpty || steamPressureBarNegative}
          helperText={buildHelper(steamPressureBarEmpty, steamPressureBarNegative)}
        />
        <TextControl
          name="steamFlow.condensateTempC"
          label="Температура конденсата, °C"
          control={control}
          type="number"
          error={condensateTempCEmpty || condensateTempCNegative}
          helperText={buildHelper(condensateTempCEmpty, condensateTempCNegative)}
        />
        <TextControl
          name="steamFlow.condensateLinePressureBar"
          label="Давление в конденсатной линии, Бар (и)"
          control={control}
          type="number"
          error={condensateLinePressureBarEmpty || condensateLinePressureBarNegative}
          helperText={buildHelper(condensateLinePressureBarEmpty, condensateLinePressureBarNegative)}
        />
      </SectionCard>

      <SectionCard title="Данные по параметрам пара">
        <TextControl
          name="steamThermo.enthalpySteam"
          label="Удельная массовая энтальпия пара, кДж/кг"
          control={control}
          type="number"
          error={enthalpySteamEmpty || enthalpySteamNegative}
          helperText={buildHelper(enthalpySteamEmpty, enthalpySteamNegative)}
        />
        <TextControl
          name="steamThermo.enthalpyCondensate"
          label="Удельная массовая энтальпия конденсата, кДж/кг"
          control={control}
          type="number"
          error={enthalpyCondensateEmpty || enthalpyCondensateNegative}
          helperText={buildHelper(enthalpyCondensateEmpty, enthalpyCondensateNegative)}
        />
        <TextControl
          name="steamThermo.specificVolumeSteam"
          label="Удельный объём пара, м³/кг"
          control={control}
          type="number"
          error={specificVolumeSteamEmpty || specificVolumeSteamNegative}
          helperText={buildHelper(specificVolumeSteamEmpty, specificVolumeSteamNegative)}
        />
        <TextControl
          name="steamThermo.specificVolumeAfterValve"
          label="Удельный объём пара после РК, м³/кг"
          control={control}
          type="number"
          error={specificVolumeAfterValveEmpty || specificVolumeAfterValveNegative}
          helperText={buildHelper(specificVolumeAfterValveEmpty, specificVolumeAfterValveNegative)}
        />
      </SectionCard>

      <SectionCard title="Данные по системам">
        <TextControl
          name="system.loadKw"
          label="Мощность, кВт"
          control={control}
          type="number"
          error={loadKwEmpty || loadKwNegative}
          helperText={buildHelper(loadKwEmpty, loadKwNegative)}
        />
        <TextControl
          name="system.supplyTempC"
          label="Температура подачи, °C"
          control={control}
          type="number"
          error={supplyTempCEmpty || supplyTempCNegative}
          helperText={buildHelper(supplyTempCEmpty, supplyTempCNegative)}
        />
        <TextControl
          name="system.returnTempC"
          label="Температура обратки, °C"
          control={control}
          type="number"
          error={returnTempCEmpty || returnTempCNegative}
          helperText={buildHelper(returnTempCEmpty, returnTempCNegative)}
        />
        <TextControl
          name="system.hydraulicLossM"
          label="Гидравлические потери, м.вод.ст."
          control={control}
          type="number"
          error={hydraulicLossMEmpty || hydraulicLossMNegative}
          helperText={buildHelper(hydraulicLossMEmpty, hydraulicLossMNegative)}
        />
        <TextControl
          name="system.staticPressureM"
          label="Статическое давление, м.вод.ст."
          control={control}
          type="number"
          error={staticPressureMEmpty || staticPressureMNegative}
          helperText={buildHelper(staticPressureMEmpty, staticPressureMNegative)}
        />
        {/* «Объём системы (если есть)» — НЕ обязателен и без проверки на отрицательность */}
        <TextControl
          name="system.systemVolumeL"
          label="Объём системы (если есть), л"
          control={control}
          type="number"
        />
        <SelectControl
          name="system.designPressureBar"
          label="Расчётное давление, Бар"
          control={control}
          options={[
            { value: '6', label: '6' },
            { value: '10', label: '10' },
            { value: '16', label: '16' },
            { value: '25', label: '25' },
          ]}
          error={designPressureBarEmpty}
          helperText={designPressureBarEmpty ? REQUIRED_MSG : undefined}
        />
      </SectionCard>
    </Box>
  );
}