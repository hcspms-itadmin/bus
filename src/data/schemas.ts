import { z } from 'zod'

export const CtbEtaSchema = z.object({
  co: z.string().default('CTB'),
  route: z.string(),
  dir: z.string(),
  seq: z.number().int().nullable().optional(),
  stop: z.string(),
  dest_tc: z.string().nullable().optional(),
  dest_en: z.string().nullable().optional(),
  dest_sc: z.string().nullable().optional(),
  eta: z.string(),
  rmk_tc: z.string().nullable().optional(),
  rmk_en: z.string().nullable().optional(),
  eta_seq: z.number().int().nullable().optional(),
  data_timestamp: z.string().nullable().optional(),
})

export const CtbEtaResponseSchema = z.object({
  data: z.array(CtbEtaSchema).nullable().optional(),
})

export type CtbEtaRecord = z.infer<typeof CtbEtaSchema>

export const NlbEtaSchema = z.object({
  estimatedArrivalTime: z.string(),
  routeVariantName: z.string().nullable().optional(),
  departed: z.union([z.string(), z.number()]).nullable().optional(),
  noGPS: z.union([z.string(), z.number()]).nullable().optional(),
  wheelChair: z.union([z.string(), z.number()]).nullable().optional(),
  generateTime: z.string().nullable().optional(),
})

export const NlbEtaResponseSchema = z.object({
  estimatedArrivals: z.array(NlbEtaSchema).nullable().optional(),
  message: z.string().nullable().optional(),
})

/**
 * 九巴（etabus）route-eta 列：欄位與 CTB 幾乎同形，但無 `stop`，
 * 以 (`service_type`, `dir`, `seq`) 定位分站；`eta` 可為 null（暫無班次）。
 * `rmk_tc === '原定班次'` 表示預定班次（Scheduled Bus）。
 */
export const KmbEtaSchema = z.object({
  co: z.string().default('KMB'),
  route: z.string(),
  dir: z.string(),
  seq: z.number().int(),
  service_type: z.union([z.string(), z.number()]),
  dest_tc: z.string().nullable().optional(),
  dest_en: z.string().nullable().optional(),
  dest_sc: z.string().nullable().optional(),
  eta: z.string().nullable().optional(),
  eta_seq: z.number().int().nullable().optional(),
  rmk_tc: z.string().nullable().optional(),
  rmk_en: z.string().nullable().optional(),
  rmk_sc: z.string().nullable().optional(),
  data_timestamp: z.string().nullable().optional(),
})

export const KmbEtaResponseSchema = z.object({
  data: z.array(KmbEtaSchema).nullable().optional(),
})

export type KmbEtaRecord = z.infer<typeof KmbEtaSchema>

export type NlbEtaRecord = z.infer<typeof NlbEtaSchema>