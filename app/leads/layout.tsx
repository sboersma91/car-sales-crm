export default function LeadsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <form action="/api/auth/logout" method="post">
          <button type="submit">Log out</button>
        </form>
      </div>
      {children}
    </>
  )
}
