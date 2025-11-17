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
  return FAQ_KEYWORDS.some(keyword => normalized.includes(keyword))
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
    
    // Patterns that indicate questions
    const questionPatterns = [
      /^q:\s*/i,
      /^question:\s*/i,
      /^\d+\.\s+.*\?$/, // Numbered question ending with ?
      /^[a-z]\.\s+.*\?$/i, // Lettered question ending with ?
      /.*\?$/, // Any text ending with ?
    ]
    
    if (questionPatterns.some(pattern => pattern.test(text))) {
      return true
    }
    
    // Check if it's a short paragraph starting with question words (likely a question)
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'will', 'should', 'does', 'is', 'are']
    const lowerText = text.toLowerCase()
    if (questionWords.some(word => lowerText.startsWith(word)) && text.length < 150 && !text.includes('.')) {
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

export interface ParsedFAQResult {
  faqBlocks: FAQBlockData[]
  remainingNodes: LexicalNode[]
}

export function parseFAQsFromLexical(nodes: LexicalNode[]): ParsedFAQResult {
  const faqBlocks: FAQBlockData[] = []
  const remainingNodes: LexicalNode[] = []
  
  let i = 0
  let inFAQSection = false
  let currentFAQ: FAQBlockData | null = null
  let currentQuestion: string | null = null
  let answerNodes: LexicalNode[] = []
  
  while (i < nodes.length) {
    const node = nodes[i]
    const nodeText = extractTextFromNode(node).trim()
    
    // Check if this is a FAQ section heading
    if (node.type === 'heading' && isFAQHeading(nodeText)) {
      // If we were in a FAQ section, save it
      if (currentFAQ && currentFAQ.items.length > 0) {
        faqBlocks.push(currentFAQ)
      }
      
      // Start new FAQ section
      inFAQSection = true
      currentFAQ = {
        title: nodeText,
        items: [],
      }
      currentQuestion = null
      answerNodes = []
      i++
      continue
    }
    
    // If we're in a FAQ section
    if (inFAQSection && currentFAQ) {
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
          faqBlocks.push(currentFAQ)
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
      faqBlocks.push(currentFAQ)
    }
  }
  
  return {
    faqBlocks,
    remainingNodes,
  }
}

