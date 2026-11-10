// src/components/form/InputForm.tsx

import type { ReactElement } from 'react';
import {
  Fragment,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import {
  Box,
  Button,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Alert,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { DEFAULT_INPUT, EMPTY_INPUT } from '../../core/defaults';
import type { InputData, CalcResult } from '../../core/types';
import { calculate } from '../../core/calc';
import { TAB_FIELDS, getEmptyValueForPath } from '../../core/tabFieldMap';
import { GlobalEditContext } from './GlobalEditContext';

import { GlobalDataTab } from './tabs/GlobalDataTab';
import { SteamPipeTab } from './tabs/SteamPipeTab';
import { CondensateTrapTab } from './tabs/CondensateTrapTab';
import { ControlValveTab } from './tabs/ControlValveTab';
import { SafetyValveTab } from './tabs/SafetyValveTab';
import { SecondaryCircuitTab } from './tabs/SecondaryCircuitTab';
import { MakeUpTab } from './tabs/MakeUpTab';
import { ChoiceSecondaryArmatureTab } from './tabs/ChoiceSecondaryArmatureTab';
import { ChoiceMakeupArmatureTab } from './tabs/ChoiceMakeupArmatureTab';
import { ChoicePumpTab } from './tabs/ChoicePumpTab';
import { ChoicePtoTab } from './tabs/ChoicePtoTab';
import { PumpsTab } from './tabs/PumpsTab';
import { DesignTab } from './tabs/DesignTab';
import { SchemeTab } from './tabs/SchemeTab';

interface Props {
  onCalculated: (data: InputData, result: CalcResult) => void;
}

export interface InputFormHandle {
  getValues: () => InputData;
}

type NavItem = { key: string; label: string; element: ReactElement };
type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Общие данные',
    items: [
      { key: 'global', label: 'Глобальные данные', element: <GlobalDataTab /> },
      { key: 'scheme', label: 'Параметры схемы', element: <SchemeTab /> },
    ],
  },
  {
    title: 'Расчёт оборудования',
    items: [
      { key: 'steam-pipe', label: 'Паропровод', element: <SteamPipeTab /> },
      { key: 'trap', label: 'Конденсатоотводчик', element: <CondensateTrapTab /> },
      { key: 'control-valve', label: 'Регулирующий клапан', element: <ControlValveTab /> },
      { key: 'safety-valve', label: 'Предохранительный клапан', element: <SafetyValveTab /> },
      { key: 'secondary', label: 'Вторичный контур', element: <SecondaryCircuitTab /> },
      { key: 'pumps', label: 'Циркуляционные насосы', element: <PumpsTab /> },
      { key: 'makeup', label: 'Подпитка', element: <MakeUpTab /> },
    ],
  },
  {
    title: 'Подбор компонентов',
    items: [
      { key: 'arm-secondary', label: 'Арматура · Вторичка', element: <ChoiceSecondaryArmatureTab /> },
      { key: 'arm-makeup', label: 'Арматура · Подпитка', element: <ChoiceMakeupArmatureTab /> },
      { key: 'pump-choice', label: 'Насос', element: <ChoicePumpTab /> },
      { key: 'pto', label: 'ПТО', element: <ChoicePtoTab /> },
    ],
  },
  {
    title: 'Документ',
    items: [
      { key: 'design', label: 'Оформление', element: <DesignTab /> },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

const GLOBAL_PATHS = new Set<string>([
  'steamFlow.steamTempC',
  'steamFlow.steamPressureBar',
  'steamFlow.condensateTempC',
  'steamFlow.condensateLinePressureBar',
  'steamThermo.enthalpySteam',
  'steamThermo.enthalpyCondensate',
  'steamThermo.specificVolumeSteam',
  'steamThermo.specificVolumeAfterValve',
  'system.loadKw',
  'system.supplyTempC',
  'system.returnTempC',
  'system.hydraulicLossM',
  'system.staticPressureM',
  'system.systemVolumeL',
  'system.designPressureBar',
]);

const DU_GUARDED_PATHS: Record<string, string> = {
  'secondaryCircuit.secondaryStandardDu': 'secondaryCircuit.editStandardDu',
  'makeUp.makeupStandardDu': 'makeUp.editStandardDu',
};

const TABS_WITH_GLOBAL_BLOCK = new Set<string>([
  'steam-pipe',
  'trap',
  'control-valve',
  'safety-valve',
  'secondary',
  'pumps',
  'makeup',
  'arm-secondary',
  'arm-makeup',
]);

const NEVER_RESET_PATHS = new Set<string>([
  'secondaryCircuit.editStandardDu',
  'makeUp.editStandardDu',
]);

export const InputForm = forwardRef<InputFormHandle, Props>(
  function InputForm({ onCalculated }, ref) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeKey, setActiveKey] = useState<string>(ALL_ITEMS[0].key);
    const [editableByTab, setEditableByTab] = useState<Record<string, boolean>>({});

    const methods = useForm<InputData>({
      defaultValues: DEFAULT_INPUT,
      mode: 'onChange',
    });

    const {
      formState: { errors, isSubmitted, touchedFields },
      setValue,
      clearErrors,
      trigger,
      getValues,
      control,
    } = methods;

    // Отдаём наружу актуальные значения формы.
    useImperativeHandle(
      ref,
      () => ({
        getValues: () => getValues(),
      }),
      [getValues],
    );

    const editStandardDuSecondary = useWatch({
      control,
      name: 'secondaryCircuit.editStandardDu',
    });
    const editStandardDuMakeUp = useWatch({
      control,
      name: 'makeUp.editStandardDu',
    });

    const activeItem = useMemo(
      () => ALL_ITEMS.find(i => i.key === activeKey) ?? ALL_ITEMS[0],
      [activeKey],
    );

    const errorCount = useMemo(() => countLeafErrors(errors), [errors]);
    const hasTouched = useMemo(
      () => Object.keys(touchedFields ?? {}).length > 0,
      [touchedFields],
    );
    const showErrorSummary = (isSubmitted || hasTouched) && errorCount > 0;

    const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

    const activeIndex = useMemo(
      () => ALL_ITEMS.findIndex(i => i.key === activeKey),
      [activeKey],
    );

    const focusIndex = (index: number) => {
      const next = (index + ALL_ITEMS.length) % ALL_ITEMS.length;
      itemRefs.current[next]?.focus();
    };

    const handleListKeyDown = (e: React.KeyboardEvent) => {
      const current = itemRefs.current.findIndex(
        el => el === document.activeElement,
      );
      const base = current === -1 ? activeIndex : current;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          focusIndex(base + 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          focusIndex(base - 1);
          break;
        case 'Home':
          e.preventDefault();
          focusIndex(0);
          break;
        case 'End':
          e.preventDefault();
          focusIndex(ALL_ITEMS.length - 1);
          break;
        default:
          break;
      }
    };

    // onSubmit не нужен: расчёт вызывается через onCalculated снаружи,
    // а актуальные значения отдаются через ref.getValues().
    void calculate;
    void onCalculated;

    const handleSelect = (key: string) => {
      setActiveKey(key);
      if (isMobile) setDrawerOpen(false);
    };

    const computeResetPaths = (): string[] => {
      const all = TAB_FIELDS[activeKey] ?? [];
      const hasGlobalBlock = TABS_WITH_GLOBAL_BLOCK.has(activeKey);
      const editable = editableByTab[activeKey] ?? false;

      return all.filter((p) => {
        if (p.endsWith('.mode')) return false;
        if (p.endsWith('.editStandardDu')) return false;
        if (NEVER_RESET_PATHS.has(p)) return false;

        if (hasGlobalBlock && !editable && GLOBAL_PATHS.has(p)) return false;

        const guardField = DU_GUARDED_PATHS[p];
        if (guardField) {
          const guardValue = getValues(guardField as never) as unknown;
          if (guardValue !== true) return false;
        }

        return true;
      });
    };

    const resetPathsForDisabled = useMemo(
      () => computeResetPaths(),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [activeKey, editableByTab, editStandardDuSecondary, editStandardDuMakeUp],
    );

    const handleReset = () => {
      const paths = computeResetPaths();
      if (paths.length === 0) return;

      paths.forEach((path) => {
        const emptyValue = getEmptyValueForPath(EMPTY_INPUT, path);
        setValue(path as never, emptyValue as never, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: false,
        });
        clearErrors(path as never);
      });

      trigger(paths as never, { shouldFocus: false });
    };

    const globalEditValue = useMemo(
      () => ({
        editable: editableByTab[activeKey] ?? false,
        setEditable: (v: boolean) =>
          setEditableByTab((prev) => ({ ...prev, [activeKey]: v })),
        hasGlobalBlock: TABS_WITH_GLOBAL_BLOCK.has(activeKey),
      }),
      [activeKey, editableByTab],
    );

    const navList = (
      <List
        dense
        sx={{ width: 280, pb: 4 }}
        onKeyDown={handleListKeyDown}
      >
        {NAV_GROUPS.map(group => (
          <Fragment key={group.title}>
            <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 700, lineHeight: '32px' }}>
              {group.title}
            </ListSubheader>
            {group.items.map(item => {
              const flatIndex = ALL_ITEMS.findIndex(i => i.key === item.key);
              return (
                <ListItemButton
                  key={item.key}
                  selected={item.key === activeKey}
                  onClick={() => handleSelect(item.key)}
                  ref={el => { itemRefs.current[flatIndex] = el; }}
                  tabIndex={item.key === activeKey ? 0 : -1}
                  sx={{ pl: 3 }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
          </Fragment>
        ))}
      </List>
    );

    return (
      <FormProvider {...methods}>
        <GlobalEditContext.Provider value={globalEditValue}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            {isMobile ? (
              <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                {navList}
              </Drawer>
            ) : (
              <Box
                sx={{
                  flex: '0 0 320px',
                  position: 'sticky',
                  top: 80,
                  maxHeight: 'calc(100vh - 96px)',
                  overflowY: 'auto',
                  alignSelf: 'flex-start',
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                {navList}
              </Box>
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                {isMobile && (
                  <IconButton onClick={() => setDrawerOpen(true)}>
                    <MenuIcon />
                  </IconButton>
                )}
                <Typography variant="h5" sx={{ flex: 1 }}>
                  {activeItem.label}
                </Typography>

                {showErrorSummary && (
                  <Chip
                    color="error"
                    label={`Ошибок: ${errorCount}`}
                    size="small"
                  />
                )}

                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={resetPathsForDisabled.length === 0}
                >
                  Сбросить данные
                </Button>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {showErrorSummary && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Форма содержит ошибки. Проверьте подсвеченные поля во вкладках
                  (счётчик слева — общее число).
                </Alert>
              )}

              <Box sx={{ minHeight: '400px' }}>
                {activeItem.element}
              </Box>
            </Box>
          </Box>
        </GlobalEditContext.Provider>
      </FormProvider>
    );
  },
);

function countLeafErrors(obj: unknown): number {
  if (obj == null || typeof obj !== 'object') return 0;
  let count = 0;
  for (const value of Object.values(obj as Record<string, unknown>)) {
    if (value && typeof value === 'object' && 'message' in (value as object)) {
      count += 1;
    } else if (value && typeof value === 'object') {
      count += countLeafErrors(value);
    }
  }
  return count;
}