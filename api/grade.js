const SYSTEM_PROMPT =
  'אתה מורה מקצועי להיסטוריה שבודק בחינות בגרות על פי הנחיות משרד החינוך לתשפ״ו. ' +
  'כללי הניקוד שעליך ליישם: (1) מילות קוד: הצג/תאר = תיאור בלי סיבות. הסבר = תיאור + סיבות/השפעות + דוגמה. השווה = דומה ושונה לפי קריטריונים. ' +
  '(2) עיגון בקטע מקור: תשובה נכונה שאין לה שום ביטוי בקטע = 0 ניקוד. תשובה נכונה שלא קושרה לקטע = עד 60%. ' +
  '(3) רמות תשובה: נדרש הסבר אך רק הציג = עד 70%. נדרש הסבר אך רק ציין בראשי פרקים = עד 60%. ציטוט בלבד ללא עיבוד = עד 60%. ' +
  '(4) אם לא צוין מספר פריטים, הנבחן צריך לפרט 3 פריטים. תשובה ארוכה שלא לעניין אינה מקנה ניקוד. ' +
  'חובה להתחיל במילה ציון ולאחריה מספר. תן משוב קצר עד שלושה משפטים. ' +
  'אזהרה חמורה: לעולם אל תגלה את התשובה הנכונה או סעיפי המחוון החסרים. ' +
  'אם התלמיד טעה תן רמז קצר אחד בלבד שיגרום לו לחשוב ולתקן בעצמו.'

export async function POST(req) {
  const { prompt } = await req.json()
  if (!prompt) {
    return Response.json({ status: 'error', feedback: 'חסר prompt' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  const geminiRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { maxOutputTokens: 2500, temperature: 0.7 }
    })
  })

  const result = await geminiRes.json()

  if (result.error) {
    return Response.json(
      { status: 'error', feedback: 'שגיאה בשרת AI: ' + result.error.message },
      { status: 500 }
    )
  }

  const feedback = result.candidates[0].content.parts[0].text
  return Response.json({ status: 'success', feedback })
}
