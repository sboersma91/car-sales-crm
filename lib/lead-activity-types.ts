export const LEAD_ACTIVITY_TYPES = [
  'call',
  'text',
  'email',
  'voicemail',
  'appointment',
  'showroom',
  'note',
] as const

export type LeadActivityType = (typeof LEAD_ACTIVITY_TYPES)[number]

export function isLeadActivityType(value: unknown): value is LeadActivityType {
  return typeof value === 'string' && LEAD_ACTIVITY_TYPES.includes(value as LeadActivityType)
}
