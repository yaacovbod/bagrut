export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { adminPassword } = await req.json()

  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'סיסמת מנהל שגויה' }, { status: 401 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  const response = await fetch(
    `${supabaseUrl}/rest/v1/grades?order=created_at.desc&select=*`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }
  )

  if (!response.ok) {
    return Response.json({ error: 'שגיאה בטעינת ציונים' }, { status: 500 })
  }

  const data = await response.json()
  return Response.json(data)
}
