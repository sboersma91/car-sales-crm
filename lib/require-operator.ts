import 'server-only'

import type { User } from '@supabase/supabase-js'

import { createSupabaseAuthServerClient } from './supabase-auth-server'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type OperatorAuthorizationErrorCode = 'configuration_error' | 'forbidden' | 'unauthenticated'

export class OperatorAuthorizationError extends Error {
  readonly code: OperatorAuthorizationErrorCode

  constructor(code: OperatorAuthorizationErrorCode) {
    super(code === 'configuration_error' ? 'Operator authorization is not configured' : 'Operator access required')
    this.name = 'OperatorAuthorizationError'
    this.code = code
  }
}

function getConfiguredOperatorId(): string {
  const operatorId = process.env.CRM_OPERATOR_USER_ID?.trim().toLowerCase()

  if (!operatorId || !UUID_PATTERN.test(operatorId)) {
    throw new OperatorAuthorizationError('configuration_error')
  }

  return operatorId
}

export function requireConfiguredOperator(user: User): User {
  const operatorId = getConfiguredOperatorId()

  if (user.id.toLowerCase() !== operatorId) {
    throw new OperatorAuthorizationError('forbidden')
  }

  return user
}

export async function requireOperator(): Promise<User> {
  const supabaseAuth = await createSupabaseAuthServerClient()
  const { data, error } = await supabaseAuth.auth.getUser()

  if (error || !data.user) {
    throw new OperatorAuthorizationError('unauthenticated')
  }

  return requireConfiguredOperator(data.user)
}
