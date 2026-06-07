type LoginSearchParams = Promise<{ error?: string | string[] }>

export default async function LoginPage({ searchParams }: { searchParams: LoginSearchParams }) {
  const hasError = Boolean((await searchParams).error)

  return (
    <div style={{ maxWidth: '420px' }}>
      <h1>Operator Login</h1>
      <form action="/api/auth/login" method="post" style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
        <label htmlFor="email"><strong>Email:</strong></label>
        <input id="email" name="email" type="email" autoComplete="username" required />

        <label htmlFor="password"><strong>Password:</strong></label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />

        <button type="submit">Log in</button>
      </form>

      {hasError ? <p style={{ color: '#b00020' }}>Login failed. Check your credentials and try again.</p> : null}
    </div>
  )
}
