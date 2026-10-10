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

export type NlbEtaRecord = z.infer<typeof NlbEtaSchema>