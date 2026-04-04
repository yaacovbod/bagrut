export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { topic_id, studentName, studentClass, score, essay, feedback } = await req.json()

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  const response = await fetch(`${supabaseUrl}/rest/v1/grades`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      topic_id,
      student_name: studentName,
      student_class: studentClass,
      score,
      essay,
      feedback
    })
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Supabase error:', err)
    return Response.json({ status: 'error' }, { status: 500 })
  }

  return Response.json({ status: 'success' })
}
