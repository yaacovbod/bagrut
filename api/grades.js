import { verifyToken } from '@clerk/backend'

export async function GET(req) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY
    })
  } catch (e) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/grades?order=created_at.desc&select=*`,
    {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      }
    }
  )

  if (!response.ok) return Response.json({ error: 'שגיאה בטעינת ציונים' }, { status: 500 })

  return Response.json(await response.json())
}
