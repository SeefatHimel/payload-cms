/**
 * FAQ Parser for Google Docs
 * Detects FAQ sections and converts them to FAQ blocks
 */

import type { LexicalNode, LexicalRoot } from './googleDocsParser'

// Keywords that identify FAQ sections
const FAQ_KEYWORDS = [
  'faq',
  'frequently asked questions',
  'questions and answers',
  'q&a',
  'q and a',
  'faqs',
  'common questions',
]

/**
 * Check if a heading text indicates a FAQ section
 */
export function isFAQHeading(text: string): boolean {
  const normalized = text.toLowerCase().trim()
  // Check for ##FAQ marker (with or without space)
  if (normalized === '##faq' || normalized === '## faq' || normalized.startsWith('##faq') || normalized.startsWith('## faq')) {
    return true
  }
  // Check for FAQ keywords
  return FAQ_KEYWORDS.some(keyword => normalized.includes(keyword))
}

/**
 * Check if a node contains the ##FAQ marker (with or without space, or combined with text)
 */
function isFAQMarkerNode(node: LexicalNode): boolean {
  const text = extractTextFromNode(node).trim()
  const normalized = text.toLowerCase()
  // Support: "##FAQ", "## FAQ", "##FAQFrequently Asked Questions", etc.
  return normalized === '##faq' 
    || normalized === '## faq' 
    || normalized.startsWith('##faq') 
    || normalized.startsWith('## faq')
    || normalized.includes('##faq')
}

/**
 * Extract FAQ title from a marker node (e.g., "##FAQFrequently Asked Questions" -> "Frequently Asked Questions")
 */
function extractFAQTitleFromMarker(text: string): string | undefined {
  const normalized = text.trim()
  // If it's just the marker, return undefined
  if (normalized === '##FAQ' || normalized === '## FAQ') {
    return undefined
  }
  // Extract text after ##FAQ or ## FAQ
  const match = normalized.match(/^##\s?FAQ\s*(.+)$/i)
  if (match && match[1]) {
    return match[1].trim()
  }
  return undefined
}

/**
 * Extract text content from a Lexical node
 */
function extractTextFromNode(node: LexicalNode): string {
  if (node.type === 'text' && node.text) {
    return node.text
  }
  
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join('')
  }
  
  return ''
}

/**
 * Convert a Lexical node to a simple text paragraph
 */
function nodeToTextParagraph(text: string): LexicalNode {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

/**
 * Check if a node looks like a question
 * Questions are typically:
 * - Headings (H2, H3, H4) ending with "?"
 * - Paragraphs starting with "Q:", "Question:", or ending with "?"
 * - Bold paragraphs (often used for questions)
 */
function isQuestionNode(node: LexicalNode): boolean {
  // Check if it's a heading
  if (node.type === 'heading' && (node.tag === 'h2' || node.tag === 'h3' || node.tag === 'h4')) {
    const text = extractTextFromNode(node).trim()
    // Heading ending with ? is likely a question
    if (text.endsWith('?')) {
      return true
    }
    // Also check if heading text looks like a question (contains question words)
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'will', 'should', 'does', 'is', 'are']
    const lowerText = text.toLowerCase()
    if (questionWords.some(word => lowerText.startsWith(word)) && text.length < 100) {
      return true
    }
  }
  
  // Check if it's a paragraph that looks like a question
  if (node.type === 'paragraph') {
    const text = extractTextFromNode(node).trim()
    
    if (text.length === 0) return false
    
    // Check if paragraph contains question and answer on same line - extract just the question part
    const qaMatch = text.match(/^(.+\?)[\s\t\u000b]+(.+)$/s)
    const questionText = qaMatch ? qaMatch[1].trim() : text
    
    // Patterns that indicate questions
    const questionPatterns = [
      /^q:\s*/i,
      /^question:\s*/i,
      /^\d+\.\s+.*\?$/, // Numbered question ending with ?
      /^[a-z]\.\s+.*\?$/i, // Lettered question ending with ?
      /.*\?$/, // Any text ending with ?
    ]
    
    if (questionPatterns.some(pattern => pattern.test(questionText))) {
      return true
    }
    
    // Check if it's a short paragraph starting with question words (likely a question)
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'will', 'should', 'does', 'is', 'are', 'do', 'did', 'has', 'have', 'was', 'were']
    const lowerText = questionText.toLowerCase()
    // More lenient: allow questions that start with question words and are reasonably short
    if (questionWords.some(word => lowerText.startsWith(word + ' ') || lowerText.startsWith(word + '?')) && questionText.length < 200) {
      // Exclude if it contains a period before the question mark (likely not a question)
      const periodIndex = questionText.indexOf('.')
      const questionIndex = questionText.indexOf('?')
      if (questionIndex === -1 || (periodIndex === -1 || questionIndex < periodIndex)) {
        return true
      }
    }
    
    // Check if it's a bold paragraph (Google Docs often makes questions bold)
    // This is a heuristic - if the paragraph text is short and ends with ?, it's likely a question
    if (questionText.endsWith('?') && questionText.length < 250) {
      return true
    }
  }
  
  return false
}

/**
 * Clean question text (remove Q:, Question:, numbering, etc.)
 */
function cleanQuestionText(text: string): string {
  return text
    .replace(/^(q|question):\s*/i, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^[a-z]\.\s*/i, '')
    .trim()
}

/**
 * Check if a node looks like an answer
 * Answers are typically paragraphs that follow questions
 */
function isAnswerNode(node: LexicalNode): boolean {
  if (node.type === 'paragraph') {
    const text = extractTextFromNode(node).trim()
    
    // Answers typically:
    // - Don't end with ?
    // - Don't start with Q: or Question:
    // - Are not empty
    if (text.length > 0 && !text.endsWith('?') && !/^(q|question|a|answer):\s*/i.test(text)) {
      return true
    }
  }
  
  return false
}

/**
 * Parse FAQ sections from Lexical content
 * Returns: { faqBlocks: FAQBlock[], remainingNodes: LexicalNode[] }
 */
export interface FAQBlockData {
  title?: string
  items: Array<{
    question: string
    answer: LexicalRoot
  }>
}

export interface FAQBlockWithPosition {
  block: FAQBlockData
  insertIndex: number // Index where this FAQ block should be inserted
}

export interface ParsedFAQResult {
  faqBlocks: FAQBlockWithPosition[]
  remainingNodes: LexicalNode[]
}

export function parseFAQsFromLexical(nodes: LexicalNode[]): ParsedFAQResult {
  const faqBlocks: FAQBlockWithPosition[] = []
  const remainingNodes: LexicalNode[] = []
  
  let i = 0
  let inFAQSection = false
  let currentFAQ: FAQBlockData | null = null
  let currentQuestion: string | null = null
  let answerNodes: LexicalNode[] = []
  let faqStartIndex = 0 // Track where the FAQ section started
  
  while (i < nodes.length) {
    const node = nodes[i]
    const nodeText = extractTextFromNode(node).trim()
    
    // Check if this is a FAQ marker (##FAQ) or FAQ section heading
    const isFAQMarker = isFAQMarkerNode(node)
    const isFAQHeadingNode = node.type === 'heading' && isFAQHeading(nodeText)
    
    if (isFAQMarker || isFAQHeadingNode) {
      // If we were in a FAQ section, save it with its position
      if (currentFAQ && currentFAQ.items.length > 0) {
        faqBlocks.push({
          block: currentFAQ,
          insertIndex: faqStartIndex,
        })
      }
      
      // Record where this FAQ section starts (in remainingNodes array)
      faqStartIndex = remainingNodes.length
      
      // Start new FAQ section
      inFAQSection = true
      // If it's a marker (##FAQ), look for the next heading as the title
      // Otherwise use the heading text as title
      if (isFAQMarker) {
        // Extract title from marker if combined (e.g., "##FAQFrequently Asked Questions")
        const markerText = extractTextFromNode(node).trim()
        const extractedTitle = extractFAQTitleFromMarker(markerText)
        
        // Skip the ##FAQ marker node
        i++
        
        // If title was extracted from marker, use it
        if (extractedTitle) {
          currentFAQ = {
            title: extractedTitle,
            items: [],
          }
          currentQuestion = null
          answerNodes = []
          continue
        }
        
        // Otherwise, look for the next heading to use as title (if it exists)
        let titleFound = false
        while (i < nodes.length) {
          const nextNode = nodes[i]
          if (nextNode.type === 'heading') {
            const nextText = extractTextFromNode(nextNode).trim()
            // If it's not another FAQ marker, use it as title
            if (!isFAQMarkerNode(nextNode)) {
              currentFAQ = {
                title: nextText,
                items: [],
              }
              titleFound = true
              i++ // Skip the title heading
              break
            }
          }
          // If we hit a question before finding a title, that's okay - start FAQ without title
          if (isQuestionNode(nextNode)) {
            break
          }
          // Skip empty paragraphs or other non-heading nodes before title
          i++
        }
        
        // If no title found, start FAQ without title
        if (!titleFound) {
          currentFAQ = {
            title: undefined,
            items: [],
          }
        }
        
        currentQuestion = null
        answerNodes = []
        continue
      } else {
        // It's a FAQ heading, use it as title
        currentFAQ = {
          title: nodeText,
          items: [],
        }
        currentQuestion = null
        answerNodes = []
        i++
        continue
      }
    }
    
    // If we're in a FAQ section
    if (inFAQSection && currentFAQ) {
      // Check if this paragraph contains both question and answer on the same line
      // Pattern: "Question? Answer text" or "Question?\tAnswer text" or "Question?\u000bAnswer text"
      if (node.type === 'paragraph' && currentQuestion === null) {
        const text = extractTextFromNode(node).trim()
        // Check if it contains a question mark followed by answer text
        const qaMatch = text.match(/^(.+\?)[\s\t\u000b]+(.+)$/s)
        if (qaMatch) {
          const questionText = cleanQuestionText(qaMatch[1])
          const answerText = qaMatch[2].trim()
          
          // If we have a previous Q&A, save it
          if (currentQuestion && answerNodes.length > 0) {
            currentFAQ.items.push({
              question: currentQuestion,
              answer: {
                root: {
                  type: 'root',
                  children: answerNodes,
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              },
            })
          }
          
          // Create answer node from the answer text
          const answerNode = nodeToTextParagraph(answerText)
          
          // Save this Q&A pair
          currentFAQ.items.push({
            question: questionText,
            answer: {
              root: {
                type: 'root',
                children: [answerNode],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          })
          
          currentQuestion = null
          answerNodes = []
          i++
          continue
        }
      }
      
      // Check if this is a question
      if (isQuestionNode(node)) {
        // Save previous Q&A if exists
        if (currentQuestion && answerNodes.length > 0) {
          currentFAQ.items.push({
            question: currentQuestion,
            answer: {
              root: {
                type: 'root',
                children: answerNodes,
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          })
        }
        
        // Start new question
        currentQuestion = cleanQuestionText(nodeText)
        answerNodes = []
        i++
        continue
      }
      
      // Check if this is an answer
      if (isAnswerNode(node) && currentQuestion) {
        answerNodes.push(node)
        i++
        continue
      }
      
      // If we hit a major heading (H1, H2) that's not a FAQ heading, end FAQ section
      if (node.type === 'heading' && (node.tag === 'h1' || (node.tag === 'h2' && !isFAQHeading(nodeText)))) {
        // Save current FAQ
        if (currentQuestion && answerNodes.length > 0) {
          currentFAQ.items.push({
            question: currentQuestion,
            answer: {
              root: {
                type: 'root',
                children: answerNodes,
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          })
        }
        
        if (currentFAQ.items.length > 0) {
          faqBlocks.push(currentFAQ)
        }
        
        inFAQSection = false
        currentFAQ = null
        currentQuestion = null
        answerNodes = []
        // Don't skip this node, add it to remaining
        remainingNodes.push(node)
        i++
        continue
      }
      
      // If we hit something that's not a question or answer, end FAQ section
      if (!isQuestionNode(node) && !isAnswerNode(node) && nodeText.length > 0) {
        // Save current FAQ
        if (currentQuestion && answerNodes.length > 0) {
          currentFAQ.items.push({
            question: currentQuestion,
            answer: {
              root: {
                type: 'root',
                children: answerNodes,
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          })
        }
        
        if (currentFAQ.items.length > 0) {
          faqBlocks.push({
            block: currentFAQ,
            insertIndex: faqStartIndex,
          })
        }
        
        inFAQSection = false
        currentFAQ = null
        currentQuestion = null
        answerNodes = []
        // Add this node to remaining
        remainingNodes.push(node)
        i++
        continue
      }
      
      // Skip empty nodes in FAQ section
      if (nodeText.length === 0) {
        i++
        continue
      }
    }
    
    // Not in FAQ section, add to remaining nodes
    remainingNodes.push(node)
    i++
  }
  
  // Save any remaining FAQ
  if (inFAQSection && currentFAQ) {
    if (currentQuestion && answerNodes.length > 0) {
      currentFAQ.items.push({
        question: currentQuestion,
        answer: {
          root: {
            type: 'root',
            children: answerNodes,
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      })
    }
    
    if (currentFAQ.items.length > 0) {
      faqBlocks.push({
        block: currentFAQ,
        insertIndex: faqStartIndex,
      })
    }
  }
  
  return {
    faqBlocks,
    remainingNodes,
  }
}

