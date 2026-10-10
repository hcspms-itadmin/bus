export type Operator = 'CTB' | 'NLB'
export type ServiceSection = 'departures' | 'arrivals'

export interface ServiceConfig {
  id: string
  operator: Operator
  route: string
  section: ServiceSection
  displayDest: string
  displayFrom?: string
  stopId: string
  nlbRouteId?: string
  destFilter: readonly string[]
  remarkHint?: string
}

/**
 * 滿東邨實測路線配置（見 docs/api-endpoints.md §2.2）。
 * CTB：以 dest_tc 文字子串收窄（dir 欄位語義與 route-stop 不一致，唔可信賴）。
 * NLB：routeId 已細分方向（88=返滿東邨 / 89=去大橋），無須 dest 過濾。
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
]

export const DEPARTURES: readonly ServiceConfig[] = SERVICES.filter((s) => s.section === 'departures')
export const ARRIVALS: readonly ServiceConfig[] = SERVICES.filter((s) => s.section === 'arrivals')