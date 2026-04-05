import { auth, currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAIL = 'yaacovbod@gmail.com'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  if (email !== ADMIN_EMAIL) return Response.json({ error: 'Forbidden' }, { status: 403 })

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
