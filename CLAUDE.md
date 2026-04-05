# דשבורד הכנה לבגרות בהיסטוריה

## מה הפרויקט עושה
אפליקציה לתרגול לבחינות בגרות בהיסטוריה לתלמידים ישראלים.
תלמיד בוחר קטגוריה → תת-קטגוריה → נושא → עובר על שלבים אינטראקטיביים.

## Tech Stack
- Next.js App Router (JS, לא TS), Tailwind CSS
- Clerk — אוטנטיקציה
- Claude API — ציון חיבורים פתוחים (דרך `/api/grade`)
- Upstash Redis — שמירת ציונים
- קובץ `data/questions.json` + `data/texts.json` — כל התוכן

## מבנה קבצים חשוב
- `components/BagrutApp.jsx` — כל ה-UI (569 שורות, קומפוננטה אחת גדולה)
- `app/page.js` — טוען data מה-JSON ומעביר ל-BagrutApp
- `app/api/grade/route.js` — קריאה ל-Claude לציון חיבורים
- `app/api/save-grade/route.js` — שמירת ציון ב-Redis
- `app/api/grades/route.js` — שליפת ציונים (למנהל)

## Flow ניווט
category → subcategory → topic → steps (currentStep index)

## סוגי שלבים (step_type)
- `intro` — הצגת טקסט מקור
- `question` — בחירה מרובה
- `text-selection` — בחירת קטע מהמקור
- `ai-practice` — חיבור פתוח שנבדק ע"י AI

## סגנון — Golden Hour
- **Tailwind classes** (לא inline styles)
- צבעים: `amber-*` לכל הכפתורים, הדגשים, הכרטיסים
- `slate-*` — טקסט ורקעים נייטרליים
- `green-*` / `red-*` — פידבק נכון/שגוי (לא לשנות)
- רקע: background image עם שכבת amber (`rgba(251,243,220,0.60)`)

## כללים
- אל תשנה את ה-Clerk config בלי לשאול
- `ADMIN_EMAIL = 'yaacovbod@gmail.com'` — לא לשנות
- הפרויקט בעברית RTL — שמור על כל הטקסטים בעברית
- אל תפצל את BagrutApp.jsx לקומפוננטות קטנות בלי אישור
