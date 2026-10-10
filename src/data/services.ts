export type Operator = 'CTB' | 'NLB' | 'KMB'
export type ServiceSection = 'departures' | 'arrivals'

/** 九巴（etabus route-eta）以 (serviceType, dir, seq) 定位分站。 */
export interface KmbQuery {
  serviceType: string
  dir: 'O' | 'I'
  seq: number
}

export interface ServiceConfig {
  id: string
  operator: Operator
  route: string
  section: ServiceSection
  displayDest: string
  displayFrom?: string
  stopId: string
  nlbRouteId?: string
  kmbQueries?: readonly KmbQuery[]
  /** 覆寫每行顯示的目的地（如 S64X 循環返抵，API dest 仍寫機場） */
  rowDestOverride?: string
  destFilter: readonly string[]
  remarkHint?: string
}

/**
 * 滿東邨實測路線配置（見 docs/api-endpoints.md §2.2）。
 * CTB：以 dest_tc 文字子串收窄（dir 欄位語義與 route-stop 不一致，唔可信賴）。
 * NLB：routeId 已細分方向（88=返滿東邨 / 89=去大橋），無須 dest 過濾。
 * KMB（etabus，含龍運聯營線）：route-eta 無 stop 欄，以 (serviceType, dir, seq)
 *   對 route-stop 序號精確定位；st1/st3 重疊班次靠 etaMs 去重。
 */
export const SERVICES: readonly ServiceConfig[] = [
  {
    id: 'ctb-e11b-th',
    operator: 'CTB',
    route: 'E11B',
    section: 'departures',
    displayDest: '天后站',
    stopId: '001363',
    destFilter: ['天后'],
  },
  {
    id: 'ctb-e11s-th',
    operator: 'CTB',
    route: 'E11S',
    section: 'departures',
    displayDest: '天后站',
    stopId: '001363',
    destFilter: ['天后'],
    remarkHint: '繁忙時段',
  },
  {
    id: 'ctb-e22s-pl',
    operator: 'CTB',
    route: 'E22S',
    section: 'departures',
    displayDest: '寶琳',
    stopId: '001363',
    destFilter: ['寶琳'],
    remarkHint: '繁忙時段',
  },
  {
    id: 'ctb-e21x-hh',
    operator: 'CTB',
    route: 'E21X',
    section: 'departures',
    displayDest: '紅磡站',
    stopId: '001363',
    destFilter: ['紅磡'],
    remarkHint: '繁忙時段',
  },
  {
    id: 'ctb-e21a-hm',
    operator: 'CTB',
    route: 'E21A',
    section: 'departures',
    displayDest: '何文田',
    stopId: '001870',
    destFilter: ['何文田'],
  },
  {
    id: 'nlb-b6-hzmb',
    operator: 'NLB',
    route: 'B6',
    section: 'departures',
    displayDest: '港珠澳大橋香港口岸',
    stopId: '309',
    nlbRouteId: '89',
    destFilter: [],
  },
  {
    id: 'nlb-39m-tc',
    operator: 'NLB',
    route: '39M',
    section: 'departures',
    displayDest: '東涌站（循環）',
    stopId: '309',
    nlbRouteId: '95',
    destFilter: [],
  },
  {
    id: 'nlb-36x-dl',
    operator: 'NLB',
    route: '36X',
    section: 'departures',
    displayDest: '迪士尼樂園',
    stopId: '309',
    nlbRouteId: '100',
    destFilter: [],
    remarkHint: '繁忙時段',
  },
  {
    id: 'kmb-e31-yt',
    operator: 'KMB',
    route: 'E31',
    section: 'departures',
    displayDest: '東涌（逸東）',
    stopId: '56925C75ED35CF99',
    kmbQueries: [{ serviceType: '1', dir: 'O', seq: 16 }],
    destFilter: ['逸東'],
  },
  {
    id: 'kmb-e31-tw',
    operator: 'KMB',
    route: 'E31',
    section: 'departures',
    displayDest: '荃灣（愉景新城）',
    stopId: '90551F12E553D27E',
    kmbQueries: [{ serviceType: '1', dir: 'I', seq: 3 }],
    destFilter: ['荃灣'],
  },
  {
    id: 'kmb-e36a-yt',
    operator: 'KMB',
    route: 'E36A',
    section: 'departures',
    displayDest: '東涌（逸東）',
    stopId: '56925C75ED35CF99',
    kmbQueries: [{ serviceType: '1', dir: 'O', seq: 21 }],
    destFilter: ['逸東'],
  },
  {
    id: 'kmb-e36a-yl',
    operator: 'KMB',
    route: 'E36A',
    section: 'departures',
    displayDest: '元朗（德業街）',
    stopId: '90551F12E553D27E',
    kmbQueries: [{ serviceType: '1', dir: 'I', seq: 3 }],
    destFilter: ['元朗'],
  },
  {
    id: 'kmb-n31-ap',
    operator: 'KMB',
    route: 'N31',
    section: 'departures',
    displayDest: '機場（地面運輸中心）',
    stopId: '56925C75ED35CF99',
    kmbQueries: [{ serviceType: '1', dir: 'O', seq: 19 }],
    destFilter: ['機場'],
    remarkHint: '通宵',
  },
  {
    id: 'kmb-n31-tw',
    operator: 'KMB',
    route: 'N31',
    section: 'departures',
    displayDest: '荃灣（愉景新城）',
    stopId: '90551F12E553D27E',
    kmbQueries: [{ serviceType: '1', dir: 'I', seq: 11 }],
    destFilter: ['荃灣'],
    remarkHint: '通宵',
  },
  {
    id: 'kmb-s64x-ap',
    operator: 'KMB',
    route: 'S64X',
    section: 'departures',
    displayDest: '機場（循環線）',
    stopId: '90551F12E553D27E',
    kmbQueries: [
      { serviceType: '1', dir: 'O', seq: 1 },
      { serviceType: '3', dir: 'O', seq: 1 },
    ],
    destFilter: [],
  },
  {
    id: 'nlb-37h-loop',
    operator: 'NLB',
    route: '37H',
    section: 'arrivals',
    displayDest: '北大嶼山醫院（循環）',
    stopId: '310',
    nlbRouteId: '96',
    destFilter: [],
  },
  {
    id: 'nlb-b6-arr',
    operator: 'NLB',
    route: 'B6',
    section: 'arrivals',
    displayDest: '滿東邨',
    displayFrom: '港珠澳大橋香港口岸',
    stopId: '310',
    nlbRouteId: '88',
    destFilter: [],
  },
  {
    id: 'ctb-e11b-arr',
    operator: 'CTB',
    route: 'E11B',
    section: 'arrivals',
    displayDest: '東涌（滿東邨）',
    displayFrom: '天后站',
    stopId: '001363',
    destFilter: ['滿東邨'],
  },
  {
    id: 'ctb-e21a-arr',
    operator: 'CTB',
    route: 'E21A',
    section: 'arrivals',
    displayDest: '東涌（逸東邨）',
    displayFrom: '何文田',
    stopId: '001853',
    destFilter: ['逸東'],
  },
  {
    id: 'kmb-s64x-arr',
    operator: 'KMB',
    route: 'S64X',
    section: 'arrivals',
    displayDest: '滿東邨',
    displayFrom: '機場（循環線）',
    stopId: '90551F12E553D27E',
    kmbQueries: [
      { serviceType: '1', dir: 'O', seq: 28 },
      { serviceType: '3', dir: 'O', seq: 26 },
    ],
    rowDestOverride: '滿東邨',
    destFilter: [],
  },
]

export const DEPARTURES: readonly ServiceConfig[] = SERVICES.filter((s) => s.section === 'departures')
export const ARRIVALS: readonly ServiceConfig[] = SERVICES.filter((s) => s.section === 'arrivals')