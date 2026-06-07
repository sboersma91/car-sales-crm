import 'server-only'

import { NextResponse } from 'next/server'

import { OperatorAuthorizationError, requireOperator } from './require-operator'

export async function requireOperatorApi(): Promise<NextResponse | null> {
  try {
    await requireOperator()
    return null
  } catch (error) {
    if (error instanceof OperatorAuthorizationError) {
      if (error.code === 'unauthenticated') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (error.code === 'forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
