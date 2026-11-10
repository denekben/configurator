// src/core/fieldLabels.ts

export const FIELD_LABELS: Record<string, string> = {
  // === Пар в первичном контуре ===
  'steamFlow.steamTempC': 'Температура пара, °C',
  'steamFlow.steamPressureBar': 'Давление пара, Бар (и)',
  'steamFlow.condensateTempC': 'Температура конденсата, °C',
  'steamFlow.condensateLinePressureBar': 'Давление в конденсатной линии, Бар (и)',

  // === Параметры пара ===
  'steamThermo.enthalpySteam': 'Энтальпия пара, кДж/кг',
  'steamThermo.enthalpyCondensate': 'Энтальпия конденсата, кДж/кг',
  'steamThermo.specificVolumeSteam': 'Удельный объём пара, м³/кг',
  'steamThermo.specificVolumeAfterValve': 'Удельный объём пара после РК, м³/кг',

  // === Системы ===
  'system.loadKw': 'Мощность, кВт',
  'system.supplyTempC': 'Температура подачи, °C',
  'system.returnTempC': 'Температура обратки, °C',
  'system.hydraulicLossM': 'Гидравлические потери, м.вод.ст.',
  'system.staticPressureM': 'Статическое давление, м.вод.ст.',
  'system.systemVolumeL': 'Объём системы, л',
  'system.designPressureBar': 'Расчётное давление, Бар',

  // === Параметры схемы ===
  'scheme.primary.hasSeparator': 'Наличие сепаратора',
  'scheme.primary.hasAccountingPrimary': 'Наличие учёта',
  'scheme.primary.trapReserve': 'Резерв конденсатоотводчиков',
  'scheme.secondary.hxReserve': 'Резерв ПТО',
  'scheme.secondary.pumpReserve': 'Резерв насосов',
  'scheme.secondary.hasAccountingSecondary': 'Наличие учёта',
  'scheme.makeup.makeupConfig': 'Конфигурация подпитки',
  'scheme.makeup.hasExpansionTank': 'Наличие расширительного бака',
  'scheme.makeup.aupdConfig': 'Наличие АУПД / АУПДз',

  // === Паропровод ===
  'steamPipe.mode': 'Режим подбора (паропровод)',
  'steamPipe.steamSpeedMs': 'Предварительная скорость пара, м/с',

  // === Конденсатоотводчик ===
  'condensateTrap.mode': 'Режим подбора (конденсатоотводчик)',
  'condensateTrap.trapReserveFactor': 'Запас на расход',
  'results.trapDu': 'Ду конденсатоотводчика, мм',
  'results.trapDesignDeltaP': 'Расчётный перепад, Бар',
  'results.trapTypeDeltaP': 'Перепад конденсатоотводчика, Бар',
  'results.trapActualCapacityKgH': 'Пропускная способность конденсатоотводчика, кг/ч',
  'results.standardDiameterMm': 'Стандартный Ду паропровода, мм',

  // === Регулирующий клапан ===
  'controlValve.mode': 'Режим подбора (РК)',
  'controlValve.valveDeltaPAssumed': 'Перепад на клапане, Бар',
  'controlValve.valveType': 'Тип РК',
  'controlValve.valveDu': 'Ду РК',
  'controlValve.actuatorControl': 'Тип управления привода',
  'controlValve.actuatorVoltage': 'Напряжение привода',
  'controlValve.actuatorSuSd': 'SU|SD привода',

  // === Предохранительный клапан ===
  'safetyValve.mode': 'Режим подбора (ПК)',
  'safetyValve.safetyValveDu': 'Диаметр отвода ПК, мм',

  // === Вторичный контур ===
  'secondaryCircuit.mode': 'Режим подбора (вторичный контур)',
  'secondaryCircuit.secondaryPreliminarySpeed': 'Скорость в первом приближении, м/с',
  'secondaryCircuit.secondaryStandardDu': 'Стандартный Ду вторичного контура, мм',
  'secondaryCircuit.editStandardDu': 'Разрешение редактировать Ду',

  // === Циркуляционные насосы ===
  'pumps.mode': 'Режим подбора (насосы)',
  'pumps.pumpCount': 'Количество работающих насосов',
  'pumps.hxLossM': 'Потери в ПТО, м.вод.ст.',
  'pumps.reserveM': 'Запас по напору, м.вод.ст.',
  'pumps.extraLossM': 'Доп. потери, м.вод.ст.',

  // === Подпитка ===
  'makeUp.mode': 'Режим подбора (подпитка)',
  'makeUp.makeupVolumeCoef': 'Коэффициент объёма, л/кВт',
  'makeUp.makeupPreliminarySpeed': 'Скорость в первом приближении, м/с',
  'makeUp.makeupStandardDu': 'Стандартный Ду подпитки, мм',
  'makeUp.editStandardDu': 'Разрешение редактировать Ду (подпитка)',

  // === Арматура · Вторичка ===
  'secondaryArmature.mode': 'Режим подбора (арматура вторички)',
  'secondaryArmature.connectionType': 'Тип присоединения',
  'secondaryArmature.valveName': 'Запорный клапан',
  'secondaryArmature.checkValveName': 'Обратный клапан',
  'secondaryArmature.filterName': 'Фильтр',

  // === Арматура · Подпитка ===
  'makeupArmature.mode': 'Режим подбора (арматура подпитки)',
  'makeupArmature.connectionType': 'Тип присоединения',
  'makeupArmature.valveName': 'Запорный клапан',
  'makeupArmature.checkValveName': 'Обратный клапан',

  // === Насос ===
  'choicePump.pumpName': 'Название насоса',
  'choicePump.pumpCode': 'Код насоса',
  'choicePump.headM': 'Напор насоса, м.вод.ст.',
  'choicePump.flowM3h': 'Расход насоса, м³/ч',

  // === ПТО ===
  'pto.name': 'Название ПТО',
  'pto.code': 'Кодовый номер ПТО',
  'pto.reserve': 'Процент резервирования',
  'pto.primaryFlow': 'Расход по первичке',
  'pto.secondaryFlow': 'Расход по вторичке',
  'pto.primaryLoss': 'Потери давления по первичке',
  'pto.secondaryLoss': 'Потери давления по вторичке',
  'pto.priceHi': 'Цена из HI',
  'pto.margin': 'Запас',

  // === Оформление ===
  'design.systemName': 'Наименование системы',
  'design.objectName': 'Название объекта',
  'design.author': 'Автор',
  'design.taskAuthor': 'Автор задачи в ЦРМ',
  'design.taskAuthorPhone': 'Номер автора задачи',
  'design.calcNumber': 'Номер расчёта',
  'design.schemeKind': 'Принципиальная схема',
};

/**
 * Названия разделов.
 * Ключ — либо первый сегмент (`system`, `steamFlow`, ...),
 * либо первые два для `scheme.*` (`scheme.primary`, `scheme.secondary`, `scheme.makeup`).
 */
export const SECTION_LABELS: Record<string, string> = {
  // `scheme.*` — по подразделам
  'scheme.primary': 'Параметры схемы: Первичный контур',
  'scheme.secondary': 'Параметры схемы: Вторичный контур',
  'scheme.makeup': 'Параметры схемы: Линия подпитки',

  // остальные — по первому сегменту
  steamFlow: 'Данные по пару в первичном контуре',
  steamThermo: 'Данные по параметрам пара',
  system: 'Данные по системам',
  steamPipe: 'Паропровод',
  condensateTrap: 'Конденсатоотводчик',
  controlValve: 'Регулирующий клапан',
  safetyValve: 'Предохранительный клапан',
  secondaryCircuit: 'Вторичный контур',
  pumps: 'Циркуляционные насосы',
  makeUp: 'Подпитка',
  secondaryArmature: 'Арматура · Вторичка',
  makeupArmature: 'Арматура · Подпитка',
  choicePump: 'Насос',
  pto: 'ПТО',
  design: 'Оформление',
  results: 'Результаты расчёта',
};

/**
 * Переопределение раздела для полей results.*: каждое поле относится
 * к своему разделу, а не к общему «Результаты расчёта».
 * Ключ — путь БЕЗ префикса `results.`.
 */
export const RESULT_PATH_SECTION: Record<string, string> = {
  // Паропровод
  standardDiameterMm: 'steamPipe',
  steamFlowKgH: 'steamPipe',
  preliminarySpeedMs: 'steamPipe',
  estimatedPipeAreaM2: 'steamPipe',
  estimatedDiameterMm: 'steamPipe',
  pipeCrossSectionAreaM2: 'steamPipe',
  actualSpeedMs: 'steamPipe',

  // Конденсатоотводчик
  trapSteamFlowKgH: 'condensateTrap',
  trapReserveFactor: 'condensateTrap',
  trapDeltaP: 'condensateTrap',
  trapRequiredFlowKgH: 'condensateTrap',
  trapDu: 'condensateTrap',
  trapDesignDeltaP: 'condensateTrap',
  trapTypeDeltaP: 'condensateTrap',
  trapActualCapacityKgH: 'condensateTrap',
  trapSelectedDeltaP: 'condensateTrap',
  trapIsSufficient: 'condensateTrap',

  // Регулирующий клапан
  valveSteamFlowKgH: 'controlValve',
  valveP1Bar: 'controlValve',
  valveDeltaPBar: 'controlValve',
  valveP2Bar: 'controlValve',
  valveX: 'controlValve',
  valveKvRequired: 'controlValve',
  valveType: 'controlValve',
  valveDu: 'controlValve',
  valveKvActual: 'controlValve',
  valveActualDeltaP: 'controlValve',
  valveOverloaded: 'controlValve',
  actuatorName: 'controlValve',
  actuatorCode: 'controlValve',
  actuatorControlType: 'controlValve',
  actuatorVoltage: 'controlValve',
  actuatorSuSd: 'controlValve',

  // Предохранительный клапан
  safetyValveDuMm: 'safetyValve',

  // Вторичный контур
  secondaryFlowM3h: 'secondaryCircuit',
  secondaryPreliminarySpeed: 'secondaryCircuit',
  secondaryEstimatedDuMm: 'secondaryCircuit',
  secondaryStandardDuMm: 'secondaryCircuit',
  secondaryActualSpeedMs: 'secondaryCircuit',

  // Циркуляционные насосы
  pumpFlowM3h: 'pumps',
  pumpHeadM: 'pumps',

  // Подпитка
  makeupVolumeCoef: 'makeUp',
  makeupFlowM3h: 'makeUp',
  makeupPreliminarySpeed: 'makeUp',
  makeupEstimatedDuMm: 'makeUp',
  makeupStandardDuMm: 'makeUp',
  makeupActualSpeedMs: 'makeUp',
};

/**
 * Возвращает ключ раздела:
 * - `results.<field>` — по RESULT_PATH_SECTION (раздел конкретного поля);
 * - `scheme.primary.*`, `scheme.secondary.*`, `scheme.makeup.*` — первые два сегмента;
 * - остальные — первый сегмент.
 */
export function getSectionOf(path: string): string {
  const parts = path.split('.');

  if (parts[0] === 'results' && parts.length >= 2) {
    const field = parts.slice(1).join('.');
    return RESULT_PATH_SECTION[field] ?? 'results';
  }

  if (parts[0] === 'scheme' && parts.length >= 2) {
    return `${parts[0]}.${parts[1]}`;
  }

  return parts[0] ?? '';
}

/** Человекочитаемое название раздела или сам ключ, если неизвестно. */
export function humanizeSection(section: string): string {
  return SECTION_LABELS[section] ?? section;
}

/** Человекочитаемое название или последний сегмент пути, если неизвестно. */
export function humanizePath(path: string): string {
  return FIELD_LABELS[path] ?? path.split('.').pop() ?? path;
}