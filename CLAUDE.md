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

### `intro`
- מציג את טקסט המקור לקריאה לפני השאלות
- `content`: הוראות קריאה
- אין `correct_answer` / `options`

### `text-selection`
- התלמיד לוחץ על משפט בטקסט
- `options`: מערך עם מחרוזת טווח אחת כמו `["'1-8'"]` — אילו IDs מ-`texts.json` להציג
- `correct_answer`: מספר (ID של המשפט הנכון), או מערך של מספרים אם `require_multiple: true`
- `require_multiple: true` — התלמיד צריך לסמן **כמה משפטים** (תשובה נכונה היא מערך)
- `explanation`: הסבר מדוע זו התשובה הנכונה

### `question`
- בחירה מרובה (multiple choice)
- `options`: מערך של טקסטי תשובה
- `correct_answer`: אינדקס (0-based) של התשובה הנכונה
- `explanation`: הסבר שמופיע אחרי בחירת התשובה

### `ai-practice`
- חיבור פתוח שנבדק ע"י Claude API
- `content`: שאלת הבגרות המלאה
- `reference_answer`: תשובת מודל — Claude משווה אליה את תשובת התלמיד
- `image_url`: אופציונלי — שם קובץ תמונה (למשל קריקטורה) שמוצג לצד השאלה
- אין `options` / `correct_answer`

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
