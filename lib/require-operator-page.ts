import 'server-only'

import { redirect } from 'next/navigation'

import { OperatorAuthorizationError, requireOperator } from './require-operator'

export type OperatorPageAccessFailure = 'configuration_error' | 'forbidden'

export async function requireOperatorPage(): Promise<OperatorPageAccessFailure | null> {
  try {
    await requireOperator()
    return null
  } catch (error) {
    if (error instanceof OperatorAuthorizationError) {
      if (error.code === 'unauthenticated') {
        redirect('/login')
      }

      return error.code
    }

    return 'configuration_error'
  }
}
