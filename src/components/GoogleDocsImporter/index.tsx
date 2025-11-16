'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { toast } from '@payloadcms/ui'
import { extractGoogleDocId, isValidGoogleDocId } from '@/utilities/extractGoogleDocId'

interface ImportResult {
  success: boolean
  post?: {
    id: number
    title: string
    slug: string
  }
  imagesProcessed?: number
  isUpdate?: boolean
  error?: string
  details?: string
}

export const GoogleDocsImporter: React.FC<{ onImportSuccess?: () => void }> = ({ onImportSuccess }) => {
  const [docId, setDocId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleImport = async () => {
    if (!docId.trim()) {
      setResult({ success: false, error: 'Please enter a Google Doc URL or ID' })
      return
    }

    // Extract Doc ID from URL or use as-is
    const extractedId = extractGoogleDocId(docId.trim())
    
    if (!extractedId) {
      setResult({ 
        success: false, 
        error: 'Invalid Google Doc URL or ID',
        details: 'Please provide a valid Google Doc URL or ID'
      })
      return
    }

    if (!isValidGoogleDocId(extractedId)) {
      setResult({ 
        success: false, 
        error: 'Invalid Google Doc ID format',
        details: 'The extracted ID does not appear to be a valid Google Doc ID'
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes timeout

      const response = await fetch('/api/import/google-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docId: extractedId }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if response is ok before parsing
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          post: data.post,
          imagesProcessed: data.imagesProcessed,
        })
        setDocId('') // Clear input on success
        toast.success(`Successfully imported: ${data.post?.title}`)
        // Call success callback if provided
        if (onImportSuccess) {
          onImportSuccess()
        }
      } else {
        const errorMsg = data.error || 'Import failed'
        setResult({
          success: false,
          error: errorMsg,
          details: data.message || data.details,
        })
        toast.error(errorMsg)
      }
    } catch (error) {
      let errorMsg = 'Unknown error'
      let errorTitle = 'Import failed'

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorTitle = 'Request timeout'
          errorMsg = 'The import took too long. The document might be very large. Please try again or check server logs.'
        } else if (error.message.includes('fetch')) {
          errorTitle = 'Network error'
          errorMsg = 'Failed to connect to server. Please check your connection and try again.'
        } else {
          errorMsg = error.message
        }
      }

      setResult({
        success: false,
        error: errorTitle,
        details: errorMsg,
      })
      toast.error(`${errorTitle}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = () => {
    window.location.href = '/api/google-oauth/login'
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '20px' }}>Import Google Doc</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p style={{ marginBottom: '10px' }}>
          First, make sure you&apos;ve completed the OAuth flow:
        </p>
        <button
          onClick={handleOAuthLogin}
          type="button"
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Authenticate with Google
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="docId" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Google Doc URL or ID:
        </label>
        <input
          id="docId"
          type="text"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          placeholder="Paste Google Doc URL or ID"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '8px',
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleImport()
            }
          }}
        />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          You can paste either:
          <br />• Full URL: https://docs.google.com/document/d/DOC_ID/edit
          <br />• Just the ID: DOC_ID
        </p>
      </div>

      <button
        onClick={handleImport}
        disabled={loading || !docId.trim()}
        type="button"
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: loading || !docId.trim() ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !docId.trim() ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Importing...' : 'Import Document'}
      </button>

      {result && (
        <div
          style={{
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
            color: result.success ? '#155724' : '#721c24',
          }}
        >
          {result.success ? (
            <div>
              <strong>Success!</strong>
              <p>Post {result.isUpdate ? 'updated' : 'created'}: {result.post?.title}</p>
              <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={`/admin/collections/posts/${result.post?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#155724', textDecoration: 'underline' }}
                >
                  View Post
                </a>
                <Link
                  href="/admin/google-docs"
                  style={{ color: '#155724', textDecoration: 'underline' }}
                >
                  Manage Imports
                </Link>
              </div>
              {result.imagesProcessed !== undefined && (
                <p style={{ marginTop: '8px', marginBottom: 0 }}>Images processed: {result.imagesProcessed}</p>
              )}
            </div>
          ) : (
            <div>
              <strong>Error:</strong> {result.error}
              {result.details && <p>{result.details}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GoogleDocsImporter

