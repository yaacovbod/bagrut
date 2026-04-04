'use client'
import { useState, useEffect, useMemo } from 'react'
import { SignInButton, useUser, useClerk } from '@clerk/nextjs'
import {
  BookOpen, CheckCircle, XCircle, ArrowRight,
  FileText, Sparkles, Loader2, MessageSquare,
  LayoutDashboard, ChevronLeft, Folder, Bookmark, Lock, RotateCcw,
  ShieldCheck, LogOut, Users
} from 'lucide-react'

// ---- Admin Panel ----
function AdminPanel({ onBack }) {
  const { isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const [grades, setGrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn) {
      fetch('/api/grades')
        .then(res => res.json())
        .then(data => { setGrades(Array.isArray(data) ? data : []); setIsLoading(false) })
        .catch(() => { setError('שגיאה בטעינת ציונים'); setIsLoading(false) })
    } else {
      setIsLoading(false)
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded || isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  )

  if (!isSignedIn) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fadeIn" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full border border-slate-100 text-center">
        <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">כניסת מנהל</h1>
        <p className="text-slate-500 text-sm mb-6">היכנסו עם חשבון Clerk שלכם</p>
        <SignInButton mode="modal">
          <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-md">
            כניסה
          </button>
        </SignInButton>
        <button onClick={onBack} className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          חזרה לדשבורד תלמידים
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fadeIn" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-2xl"><ShieldCheck className="w-6 h-6 text-indigo-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">פאנל מנהל</h1>
              <p className="text-slate-500 text-sm">{grades.length} ציונים שנשמרו</p>
            </div>
          </div>
          <button
            onClick={() => { signOut(); onBack() }}
            className="flex items-center gap-2 bg-white text-slate-600 font-bold px-4 py-2 rounded-xl border border-slate-200 hover:border-red-300 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" /> התנתק
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-4 font-bold">{error}</p>}

        {grades.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-lg">עדיין אין ציונים שמורים</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['תאריך', 'שם תלמיד', 'כיתה', 'נושא', 'ציון', 'חיבור', 'משוב AI'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {grades.map((g, i) => (
                    <tr key={g.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(g.created_at).toLocaleDateString('he-IL')}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{g.student_name}</td>
                      <td className="px-4 py-3 text-slate-600">{g.student_class}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{g.topic_id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                          g.score >= 80 ? 'bg-green-100 text-green-700' :
                          g.score >= 60 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-600'
                        }`}>{g.score}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{g.essay}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{g.feedback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Main App ----
export default function BagrutApp({ initialQuestions, initialTexts, accessKey }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showExplanationMap, setShowExplanationMap] = useState({})
  const [wrongAnswersMap, setWrongAnswersMap] = useState({})
  const [showErrorMsgMap, setShowErrorMsgMap] = useState({})

  const [userEssay, setUserEssay] = useState('')
  const [isGrading, setIsGrading] = useState(false)
  const [aiFeedback, setAiFeedback] = useState('')
  const [aiScore, setAiScore] = useState(null)
  const [studentName, setStudentName] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false)

  useEffect(() => {
    if (!accessKey) {
      setIsAuthenticated(true)
    } else {
      const saved = localStorage.getItem('bagrut_site_password')
      setIsAuthenticated(saved === accessKey)
    }
    setIsLoading(false)
  }, [accessKey])

  const allData = { questions: initialQuestions, texts: initialTexts }

  const dashboardStructure = useMemo(() => {
    if (!Array.isArray(allData.questions) || !allData.questions.length) return {}
    const structure = {}
    const seen = new Set()
    allData.questions.forEach(q => {
      if (!q.category || !q.subcategory || !q.topic_id) return
      if (!structure[q.category]) structure[q.category] = { subcategories: {} }
      if (!structure[q.category].subcategories[q.subcategory])
        structure[q.category].subcategories[q.subcategory] = []
      const key = `${q.category}|${q.subcategory}|${q.topic_id}`
      if (!seen.has(key)) {
        seen.add(key)
        structure[q.category].subcategories[q.subcategory].push({ id: q.topic_id, title: q.title })
      }
    })
    return structure
  }, [allData.questions])

  const currentSteps = useMemo(() => {
    if (!selectedTopic) return []
    return allData.questions.filter(q => q.topic_id === selectedTopic)
  }, [allData, selectedTopic])

  const currentTexts = useMemo(() => {
    if (!selectedTopic) return []
    return allData.texts[selectedTopic] || []
  }, [allData, selectedTopic])

  const step = currentSteps[currentStep] || null

  const safeOptions = useMemo(() => {
    if (!step?.options) return []
    if (Array.isArray(step.options)) return step.options
    return step.options.toString().split('|').map(s => s.trim())
  }, [step])

  const displayedTexts = useMemo(() => {
    if (step?.step_type !== 'text-selection') return currentTexts
    if (safeOptions.length === 1 && safeOptions[0].includes('-')) {
      const bounds = safeOptions[0].replace(/'/g, '').split('-')
      const start = parseInt(bounds[0], 10)
      const end = parseInt(bounds[1], 10)
      return currentTexts.filter(t => parseInt(t.id, 10) >= start && parseInt(t.id, 10) <= end)
    }
    return currentTexts
  }, [currentTexts, step, safeOptions])

  const selectedAnswer = selectedAnswers[currentStep]
  const showExplanation = showExplanationMap[currentStep] || false
  const wrongAnswers = wrongAnswersMap[currentStep] || []
  const showErrorMsg = showErrorMsgMap[currentStep] || false

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (passwordInput === accessKey) {
      setIsAuthenticated(true)
      localStorage.setItem('bagrut_site_password', accessKey)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const handleAnswerSelect = (index) => {
    if (showExplanation) return
    if (step.require_multiple) {
      setShowErrorMsgMap(prev => ({ ...prev, [currentStep]: false }))
      const current = Array.isArray(selectedAnswer) ? selectedAnswer : []
      const next = current.includes(index) ? current.filter(i => i !== index) : [...current, index]
      setSelectedAnswers(prev => ({ ...prev, [currentStep]: next }))
      const correctOnes = Array.isArray(step.correct_answer) ? step.correct_answer.map(String) : [String(step.correct_answer)]
      if (next.length === correctOnes.length) {
        if (next.map(String).every(v => correctOnes.includes(v))) {
          setShowExplanationMap(prev => ({ ...prev, [currentStep]: true }))
        } else {
          const wrongOnes = next.filter(v => !correctOnes.includes(String(v)))
          const rightOnes = next.filter(v => correctOnes.includes(String(v)))
          setWrongAnswersMap(prev => ({ ...prev, [currentStep]: [...(prev[currentStep] || []), ...wrongOnes] }))
          setSelectedAnswers(prev => ({ ...prev, [currentStep]: rightOnes }))
          setShowErrorMsgMap(prev => ({ ...prev, [currentStep]: true }))
        }
      }
    } else {
      if (String(index) === String(step.correct_answer)) {
        setSelectedAnswers(prev => ({ ...prev, [currentStep]: index }))
        setShowExplanationMap(prev => ({ ...prev, [currentStep]: true }))
      } else {
        setWrongAnswersMap(prev => ({ ...prev, [currentStep]: [...(prev[currentStep] || []), index] }))
      }
    }
  }

  const handleGradeEssay = async () => {
    if (!userEssay.trim()) return
    setIsGrading(true)
    let prompt = `השאלה ${step.content}\nתשובת התלמיד ${userEssay}`
    if (step.reference_answer) prompt += `\n\nמחוון:\n${step.reference_answer}`
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const result = await res.json()
      setAiFeedback(result.feedback)
      const match = result.feedback.match(/ציון[:\s]*(\d+)/)
      if (match) setAiScore(parseInt(match[1], 10))
    } catch {
      setAiFeedback('שגיאה בתקשורת עם השרת')
    }
    setIsGrading(false)
  }

  const handleSubmitGrade = async () => {
    if (!studentName.trim()) return
    setIsSubmittingGrade(true)
    try {
      await fetch('/api/save-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: selectedTopic, studentName, studentClass, score: aiScore, essay: userEssay, feedback: aiFeedback })
      })
      setIsSubmitted(true)
      setTimeout(() => {
        setSelectedTopic(null); setCurrentStep(0); setSelectedAnswers({})
        setShowExplanationMap({}); setWrongAnswersMap({}); setShowErrorMsgMap({})
        setUserEssay(''); setAiFeedback(''); setAiScore(null)
        setIsSubmitted(false); setIsSubmittingGrade(false)
      }, 3000)
    } catch { setIsSubmittingGrade(false) }
  }

  if (isAdminMode) return <AdminPanel onBack={() => setIsAdminMode(false)} />

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  )

  if (!isAuthenticated) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fadeIn text-right" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full border border-slate-100">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4"><Lock className="w-8 h-8 text-blue-600" /></div>
          <h1 className="text-2xl font-bold text-slate-800">כניסה למערכת התרגול</h1>
          <p className="text-slate-500 mt-2">הקלידו את הסיסמה שקיבלתם מהמורה</p>
        </div>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
            placeholder="סיסמת גישה"
            className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-center text-lg" />
          {passwordError && <p className="text-red-500 text-sm text-center font-bold">הסיסמה שגויה נסו שוב</p>}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-md">
            היכנסו לדשבורד
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setIsAdminMode(true)} className="text-xs text-slate-300 hover:text-slate-500 transition-colors">כניסת מנהל</button>
        </div>
      </div>
    </div>
  )

  if (!selectedCategory) return (
    <div className="min-h-screen p-4 md:p-8 animate-fadeIn text-right" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-4 shadow-sm"><LayoutDashboard className="w-8 h-8 text-blue-600" /></div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">דשבורד הכנה לבגרות</h1>
          <p className="text-slate-800 font-medium bg-white/50 inline-block px-4 py-1 rounded-full">בחרו קטגוריה כדי להתחיל</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(dashboardStructure).map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-right group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><BookOpen className="w-6 h-6" /></div>
                <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{cat}</h3>
              </div>
              <ChevronLeft className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:-translate-x-1" />
            </button>
          ))}
        </div>
        <div className="mt-10 text-center">
          <button onClick={() => setIsAdminMode(true)} className="text-xs text-slate-300 hover:text-slate-500 transition-colors">כניסת מנהל</button>
        </div>
      </div>
    </div>
  )

  if (!selectedSubcategory) return (
    <div className="min-h-screen p-4 md:p-8 animate-fadeIn text-right" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setSelectedCategory(null)} className="bg-white/80 backdrop-blur-sm text-slate-700 hover:text-blue-600 flex items-center gap-2 mb-6 font-bold py-2 px-4 rounded-xl transition-colors">
          <ArrowRight className="w-5 h-5" /> חזרה לקטגוריות
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{selectedCategory} — רשימת נושאים</h2>
        <div className="grid grid-cols-1 gap-4">
          {Object.keys(dashboardStructure[selectedCategory]?.subcategories || {}).map(sub => (
            <button key={sub} onClick={() => setSelectedSubcategory(sub)}
              className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 transition-all text-right group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors"><Folder className="w-5 h-5" /></div>
                <span className="text-lg font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{sub}</span>
              </div>
              <ChevronLeft className="text-slate-300 group-hover:text-blue-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (!selectedTopic) {
    const topicList = dashboardStructure[selectedCategory]?.subcategories?.[selectedSubcategory] || []
    return (
      <div className="min-h-screen p-4 md:p-8 animate-fadeIn text-right" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedSubcategory(null)} className="bg-white/80 backdrop-blur-sm text-slate-700 hover:text-blue-600 flex items-center gap-2 mb-6 font-bold py-2 px-4 rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5" /> חזרה לרשימת הנושאים
          </button>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">{selectedSubcategory}</h2>
          <div className="grid grid-cols-1 gap-4">
            {topicList.map(q => (
              <button key={q.id} onClick={() => setSelectedTopic(q.id)}
                className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 transition-all text-right group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Bookmark className="w-5 h-5" /></div>
                  <span className="text-lg font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{q.title}</span>
                </div>
                <ChevronLeft className="text-slate-300 group-hover:text-indigo-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (currentSteps.length === 0) return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center text-right" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-200 max-w-lg w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">אין שאלות לנושא זה</h2>
        <button onClick={() => setSelectedTopic(null)} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">חזרה לדשבורד</button>
      </div>
    </div>
  )

  const resetStep = () => {
    setSelectedTopic(null); setCurrentStep(0); setSelectedAnswers({})
    setShowExplanationMap({}); setWrongAnswersMap({}); setShowErrorMsgMap({})
  }

  return (
    <div className="min-h-screen py-4 px-2 sm:px-4 animate-fadeIn text-right" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 text-white p-4 md:p-6 flex items-center justify-between">
          <button onClick={resetStep} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-lg md:text-xl font-bold">{step?.title}</h1>
            <p className="text-blue-100 text-xs">{step?.subtitle}</p>
          </div>
          <div className="bg-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{currentStep + 1} / {currentSteps.length}</div>
        </div>

        <div className="p-4 md:p-8">
          {step?.step_type === 'intro' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-blue-50 p-5 rounded-2xl text-blue-900 leading-relaxed font-medium">{step.content}</div>
              <div className="bg-[#fdfbf7] p-6 rounded-2xl border border-amber-200 shadow-inner max-h-96 overflow-y-auto">
                <div className="leading-loose text-lg text-slate-800">
                  {currentTexts.map(t => {
                    if (t.text?.startsWith('מקור')) return (
                      <div key={t.id} className="mt-6 mb-3 first:mt-0 px-3 py-2 bg-amber-100 border border-amber-300 rounded-xl">
                        <p className="font-bold text-amber-900 text-base">{t.text}</p>
                      </div>
                    )
                    return <span key={t.id}>{t.text} </span>
                  })}
                </div>
              </div>
            </div>
          )}

          {step?.step_type === 'text-selection' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-center text-slate-800">{step.content}</h2>
              <div className="bg-[#fdfbf7] p-6 rounded-2xl border border-amber-200 shadow-inner max-h-96 overflow-y-auto">
                <div className="leading-loose text-lg">
                  {displayedTexts.map(t => {
                    if (t.text?.startsWith('מקור')) return (
                      <div key={t.id} className="mt-6 mb-3 first:mt-0 px-3 py-2 bg-amber-100 border border-amber-300 rounded-xl">
                        <p className="font-bold text-amber-900 text-base">{t.text}</p>
                      </div>
                    )
                    const correctOnes = Array.isArray(step.correct_answer) ? step.correct_answer.map(String) : [String(step.correct_answer)]
                    const isCorrectSegment = correctOnes.includes(String(t.id))
                    const isWrong = wrongAnswers.includes(parseInt(t.id))
                    const isSelected = Array.isArray(selectedAnswer) ? selectedAnswer.includes(parseInt(t.id)) : String(selectedAnswer) === String(t.id)
                    let cls = "cursor-pointer transition-colors px-1 rounded mx-0.5 "
                    if (showExplanation) cls += isCorrectSegment ? "bg-green-300 font-bold" : isWrong ? "bg-red-200 line-through text-red-500 opacity-60" : "text-slate-400"
                    else if (isSelected) cls += showErrorMsg ? (isCorrectSegment ? "bg-green-200" : "bg-red-200 line-through") : "bg-blue-200"
                    else if (isWrong) cls += "bg-red-200 line-through text-red-600"
                    else cls += "hover:bg-amber-100"
                    return <span key={t.id} onClick={() => handleAnswerSelect(parseInt(t.id))} className={cls}>{t.text} </span>
                  })}
                </div>
              </div>
              {showExplanation && <div className="bg-green-100 p-5 rounded-2xl text-green-900 flex gap-3"><CheckCircle className="shrink-0" /><p>{step.explanation}</p></div>}
            </div>
          )}

          {step?.step_type === 'question' && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{step.content}</h2>
              {safeOptions.map((opt, idx) => {
                const isCorrect = String(idx) === String(step.correct_answer)
                const isWrong = wrongAnswers.includes(idx)
                let cls = "w-full text-right p-4 rounded-2xl border-2 transition-all "
                if (showExplanation && isCorrect) cls += "border-green-500 bg-green-50 text-green-900 font-bold"
                else if (isWrong) cls += "border-red-300 bg-red-50 text-red-500 line-through opacity-70"
                else cls += "border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700"
                return <button key={idx} onClick={() => handleAnswerSelect(idx)} disabled={showExplanation} className={cls}>{opt}</button>
              })}
              {showExplanation && <div className="bg-green-100 p-5 rounded-2xl text-green-900 flex gap-3"><CheckCircle className="shrink-0" /><p>{step.explanation}</p></div>}
            </div>
          )}

          {step?.step_type === 'ai-practice' && (
            <div className="space-y-6 animate-fadeIn">
              {currentTexts.length > 0 && (
                <div className="bg-[#fdfbf7] p-5 rounded-2xl border border-amber-200 shadow-inner max-h-48 overflow-y-auto">
                  <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2 text-sm"><FileText className="w-4 h-4" /> קטע המקור לתרגול</h3>
                  <div className="whitespace-pre-line leading-relaxed text-slate-800 text-sm">{currentTexts.map(t => <span key={t.id}>{t.text} </span>)}</div>
                </div>
              )}
              {step.image_url && (
                <div className="w-full text-center my-4">
                  <img src={step.image_url} alt="מקור חזותי" className="w-full max-w-lg mx-auto rounded-3xl shadow-xl border-4 border-slate-100 hover:scale-[1.02] transition-transform duration-300" />
                </div>
              )}
              {!aiFeedback && (
                <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100">
                  <p className="text-lg text-slate-800 font-medium leading-relaxed whitespace-pre-line">{step.content}</p>
                  <textarea value={userEssay} onChange={e => setUserEssay(e.target.value)}
                    className="w-full h-44 p-5 mt-5 rounded-2xl border-none shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                    placeholder="כתבו כאן את התשובה המפורטת שלכם" />
                  <button onClick={handleGradeEssay} disabled={isGrading || !userEssay.trim()}
                    className="w-full mt-5 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    {isGrading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    {isGrading ? 'המורה בודק...' : 'שלח לבדיקת בינה מלאכותית'}
                  </button>
                </div>
              )}
              {aiFeedback && (
                <div className={`bg-white p-6 rounded-3xl border-2 shadow-sm animate-fadeIn ${aiScore >= 80 ? 'border-green-300' : 'border-amber-300'}`}>
                  <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2"><MessageSquare className="text-blue-500" /> משוב המורה:</h3>
                  <p className="whitespace-pre-line text-slate-700 text-lg leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{aiFeedback}</p>
                  {aiScore !== null && aiScore >= 80 && !isSubmitted && (
                    <div className="mt-6 bg-green-50 p-5 rounded-2xl border border-green-200">
                      <h4 className="font-bold text-green-900 mb-3">ציון מעולה! הכניסו פרטים לשמירה</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="שם מלא" value={studentName} onChange={e => setStudentName(e.target.value)} className="p-3 rounded-xl border border-green-300" />
                        <input type="text" placeholder="כיתה" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="p-3 rounded-xl border border-green-300" />
                      </div>
                      <button onClick={handleSubmitGrade} disabled={!studentName.trim() || isSubmittingGrade}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
                        {isSubmittingGrade ? 'שומר...' : 'שלח ציון למורה'}
                      </button>
                    </div>
                  )}
                  {aiScore !== null && aiScore < 80 && !isSubmitted && (
                    <div className="mt-6 text-center">
                      <p className="text-amber-700 font-bold mb-3">קראו את המשוב ונסו לשפר את התשובה</p>
                      <button onClick={() => { setUserEssay(''); setAiFeedback(''); setAiScore(null) }}
                        className="bg-amber-500 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-amber-600 transition-all flex items-center justify-center gap-2 mx-auto">
                        <RotateCcw className="w-5 h-5" /> נסו לכתוב מחדש
                      </button>
                    </div>
                  )}
                  {isSubmitted && (
                    <div className="mt-6 bg-blue-50 p-5 rounded-2xl text-blue-900 font-bold text-center">
                      <CheckCircle className="w-10 h-10 mx-auto text-blue-500 mb-2" />
                      הציון נשמר בהצלחה — חוזר לדשבורד
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-5 border-t flex items-center justify-between">
          <button onClick={() => setCurrentStep(p => p - 1)} disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold disabled:opacity-20 transition-opacity">
            <ArrowRight className="w-5 h-5" /> חזור
          </button>
          {currentStep < currentSteps.length - 1 && (
            <button onClick={() => setCurrentStep(p => p + 1)}
              className="bg-blue-600 text-white font-bold px-10 py-3 rounded-2xl hover:bg-blue-700 transition-all">
              המשך
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
