export interface ParsedOption {
  optionText: string
  isCorrect: boolean
}

export interface ParsedQuestion {
  questionText: string
  questionType: 'mcq' | 'boolean'
  points: number
  explanation: string | null
  shuffleOptions: boolean
  options: ParsedOption[]
}

export function parseSqf(content: string): ParsedQuestion[] {
  const lines = content.split('\n')
  const questions: ParsedQuestion[] = []

  let q: ParsedQuestion | null = null
  let currentSection: 'text' | 'exp' | 'opt' | null = null
  let sectionBuffer: string[] = []

  const commitSection = (target: ParsedQuestion | null, section: string | null) => {
    if (!target || !section) return

    const text = sectionBuffer.join('\n').trim()
    if (section === 'text') {
      target.questionText = text
    } else if (section === 'exp') {
      target.explanation = text || null
    } else if (section === 'opt') {
      const lastOpt = target.options[target.options.length - 1]
      if (lastOpt && !lastOpt.optionText) {
        lastOpt.optionText = text
      }
    }
    sectionBuffer = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Treat --- as comments (skip)
    if (trimmed.startsWith('---')) {
      continue
    }

    // Tag Detections
    if (trimmed.startsWith('[TEXT]')) {
      // Commit current question if it exists
      if (q) {
        commitSection(q, currentSection)
        questions.push(q)
      }

      // Start new question
      q = {
        questionText: '',
        questionType: 'mcq',
        points: 1,
        explanation: null,
        shuffleOptions: false,
        options: [],
      }
      currentSection = 'text'
      sectionBuffer = []

      const immediate = trimmed.substring(6).trim()
      if (immediate) sectionBuffer.push(immediate)
      continue
    }

    // Following tags require an active question
    if (!q) continue

    if (trimmed.startsWith('[SHUFFLE]')) {
      commitSection(q, currentSection)
      currentSection = null
      const val = trimmed.substring(9).trim().toLowerCase()
      q.shuffleOptions = val === 'true'
    } else if (trimmed.startsWith('[TYPE]')) {
      commitSection(q, currentSection)
      currentSection = null
      const type = trimmed.substring(6).trim().toLowerCase()
      q.questionType = type === 'boolean' ? 'boolean' : 'mcq'
    } else if (trimmed.startsWith('[POINTS]')) {
      commitSection(q, currentSection)
      currentSection = null
      const pts = parseInt(trimmed.substring(8).trim(), 10)
      if (!isNaN(pts)) q.points = pts
    } else if (trimmed.startsWith('[OPT]')) {
      commitSection(q, currentSection)
      currentSection = 'opt'

      const tagContent = trimmed.substring(5).trim()
      let optionText = ''
      let isCorrect = false

      if (tagContent.includes('isCorrect:')) {
        isCorrect = tagContent.includes('isCorrect:true')
        if (tagContent.includes('|')) {
          optionText = tagContent.split('|')[0].trim()
        }
      } else {
        optionText = tagContent
      }

      q.options.push({ optionText, isCorrect })
      if (optionText) currentSection = null // Text provided on same line
    } else if (trimmed.startsWith('[EXP]')) {
      commitSection(q, currentSection)
      currentSection = 'exp'
      const immediate = trimmed.substring(5).trim()
      if (immediate) sectionBuffer.push(immediate)
    } else {
      // Content line
      if (currentSection) {
        sectionBuffer.push(line.trim() === '' ? '' : line)
      }
    }
  }

  // Final commit
  if (q) {
    commitSection(q, currentSection)
    questions.push(q)
  }

  return questions
}

export function validateParsedQuestions(questions: ParsedQuestion[]): string[] {
  const errors: string[] = []
  questions.forEach((q, i) => {
    const qNum = i + 1
    if (!q.questionText || !q.questionText.trim()) {
      errors.push(`Question ${qNum}: Question text is missing.`)
    }
    const validOptions = q.options.filter(opt => opt.optionText && opt.optionText.trim() !== '')
    if (validOptions.length < 2) {
      errors.push(
        `Question ${qNum}: At least 2 options are required (found ${validOptions.length}).`,
      )
    } else if (!validOptions.some(opt => opt.isCorrect)) {
      errors.push(`Question ${qNum}: No correct answer is marked.`)
    }
  })
  return errors
}
