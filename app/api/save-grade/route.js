export async function POST(req) {
  const { topic_id, studentName, studentClass, score, essay, feedback } = await req.json()

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/grades`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ topic_id, student_name: studentName, student_class: studentClass, score, essay, feedback })
  })

  if (!response.ok) return Response.json({ status: 'error' }, { status: 500 })
  return Response.json({ status: 'success' })
}
