import fs from 'fs'
import path from 'path'
import BagrutApp from '@/components/BagrutApp'

export default function Home() {
  const dataDir = path.join(process.cwd(), 'data')
  const questions = JSON.parse(fs.readFileSync(path.join(dataDir, 'questions.json'), 'utf8'))
  const texts = JSON.parse(fs.readFileSync(path.join(dataDir, 'texts.json'), 'utf8'))
  const accessKey = process.env.SITE_ACCESS_KEY || null

  return <BagrutApp initialQuestions={questions} initialTexts={texts} accessKey={accessKey} />
}
