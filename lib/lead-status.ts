export const LEAD_STATUSES = [
  'new',
  'contacted',
  'appointment_set',
  'working',
  'sold',
  'lost',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && LEAD_STATUSES.includes(value as LeadStatus)
}
