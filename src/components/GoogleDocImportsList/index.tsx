'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@payloadcms/ui'
import { cn } from '@/utilities/ui'
import { FileText, ExternalLink, Image as ImageIcon, Clock } from 'lucide-react'
import GoogleDocsImporter from '@/components/GoogleDocsImporter'
import './index.scss'

interface GoogleDocImport {
  id: number
  title: string
  googleDocId: string
  googleDocUrl?: string
  post: number | { id: number; title: string; slug: string }
  lastSyncedAt?: string
  status: 'active' | 'error' | 'syncing'
  errorMessage?: string
  imagesCount?: number
  updatedAt: string
}

/**
 * Custom List component for Google Doc Imports collection
 * This replaces the default list view with our unified management interface
 */
export const GoogleDocImportsList: React.FC = () => {
  const [imports, setImports] = useState<GoogleDocImport[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<Set<number>>(new Set())
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    fetchImports()
  }, [])

  const fetchImports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/google-doc-imports', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setImports(data.docs || [])
      } else {
        toast.error('Failed to load imports')
      }
    } catch (error) {
      console.error('Error fetching imports:', error)
      toast.error('Error loading imports')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (importId: number, docId: string) => {
    try {
      setSyncing((prev) => new Set(prev).add(importId))
      
      // Update status to syncing
      await fetch(`/api/google-doc-imports/${importId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'syncing' }),
      })

      // Get the import record to check useAI preference
      const importRecord = imports.find(imp => imp.id === importId)
      const shouldUseAI = importRecord?.useAI ?? true
      
      // Trigger sync with AI preference
      const response = await fetch('/api/import/google-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ docId, useAI: shouldUseAI }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Synced: ${result.post?.title || 'Document'}`)
        // Refresh the list
        await fetchImports()
        // Hide import form if it was showing
        setShowImport(false)
      } else {
        // Update status to error
        await fetch(`/api/google-doc-imports/${importId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            status: 'error',
            errorMessage: result.error || 'Sync failed',
          }),
        })
        toast.error(result.error || 'Sync failed')
        await fetchImports()
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Error syncing document')
      await fetchImports()
    } finally {
      setSyncing((prev) => {
        const next = new Set(prev)
        next.delete(importId)
        return next
      })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const getPostLink = (post: number | { id: number; title: string; slug: string }) => {
    const postId = typeof post === 'number' ? post : post.id
    return `/admin/collections/posts/${postId}`
  }

  const getPostTitle = (post: number | { id: number; title: string; slug: string }) => {
    if (typeof post === 'number') return `Post #${post}`
    return post.title
  }

  if (loading) {
    return (
      <div className="google-docs-management">
        <div className="google-docs-management__header">
          <div className="google-docs-management__header-content">
            <h1 className="google-docs-management__header-title">Google Docs Management</h1>
            <p className="google-docs-management__header-description">Loading your documents...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="google-docs-management">
      {/* Header */}
      <div className="google-docs-management__header">
        <div className="google-docs-management__header-content">
          <h1 className="google-docs-management__header-title">Google Docs Management</h1>
          <p className="google-docs-management__header-description">
            Import, sync, and manage all your Google Docs in one unified interface
          </p>
        </div>
        <div className="google-docs-management__header-actions">
          <button
            className="btn btn--style-primary"
            onClick={() => setShowImport(!showImport)}
            type="button"
          >
            {showImport ? 'Hide Import' : 'Import New Doc'}
          </button>
          <button
            className="btn btn--style-secondary"
            onClick={fetchImports}
            type="button"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Import Form */}
      {showImport && (
        <div className="google-docs-management__import-form">
          <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>
            Import Google Doc
          </h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--theme-elevation-500)', fontSize: '0.875rem' }}>
            Paste a Google Doc URL or ID to import it into your CMS
          </p>
          <GoogleDocsImporter 
            onImportSuccess={() => {
              fetchImports()
              setShowImport(false)
            }}
          />
        </div>
      )}

      {/* Empty State */}
      {imports.length === 0 && !showImport && (
        <div className="google-docs-management__empty-state">
          <div className="google-docs-management__empty-state-icon">
            <FileText style={{ width: '48px', height: '48px', opacity: 0.5 }} />
          </div>
          <h3 className="google-docs-management__empty-state-title">No Google Docs imported yet</h3>
          <p className="google-docs-management__empty-state-description">
            Get started by importing your first Google Doc. It will be automatically converted into a blog post.
          </p>
          <button
            className="btn btn--style-primary btn--size-large"
            onClick={() => setShowImport(true)}
            type="button"
          >
            Import your first Google Doc
          </button>
        </div>
      )}

      {/* Table */}
      {imports.length > 0 && (
        <div className="google-docs-management__table-wrapper">
          <div className="google-docs-management__table-header">
            <h2 className="google-docs-management__table-header-title">Imported Documents</h2>
            <p className="google-docs-management__table-header-description">
              {imports.length} document{imports.length !== 1 ? 's' : ''} imported
            </p>
          </div>
          <table className="google-docs-management__table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Doc ID</th>
                <th>Post</th>
                <th>Status</th>
                <th>Last Synced</th>
                <th style={{ textAlign: 'center' }}>Images</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {imports.map((importItem) => (
                <tr key={importItem.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText style={{ width: '16px', height: '16px', opacity: 0.6, flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{importItem.title}</span>
                    </div>
                  </td>
                  <td>
                    <code style={{
                      background: 'var(--theme-elevation-100)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: 'var(--theme-elevation-600)',
                      border: '1px solid var(--theme-elevation-200)'
                    }}>
                      {importItem.googleDocId.substring(0, 24)}...
                    </code>
                  </td>
                  <td>
                    <a
                      href={getPostLink(importItem.post)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--color-success-600)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {getPostTitle(importItem.post)}
                      <ExternalLink style={{ width: '14px', height: '14px' }} />
                    </a>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <span
                        className={cn(
                          'google-docs-management__status-badge',
                          `google-docs-management__status-badge--${importItem.status}`
                        )}
                      >
                        {importItem.status.charAt(0).toUpperCase() + importItem.status.slice(1)}
                      </span>
                      {importItem.errorMessage && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-error-600)' }}>
                          {importItem.errorMessage}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--theme-elevation-600)' }}>
                      <Clock style={{ width: '14px', height: '14px' }} />
                      <span>{formatDate(importItem.lastSyncedAt)}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                      <ImageIcon style={{ width: '16px', height: '16px', opacity: 0.6 }} />
                      <span style={{ fontWeight: 500 }}>{importItem.imagesCount || 0}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn--style-secondary btn--size-small"
                      onClick={() => handleSync(importItem.id, importItem.googleDocId)}
                      disabled={syncing.has(importItem.id)}
                      type="button"
                    >
                      {syncing.has(importItem.id) ? 'Syncing...' : 'Sync'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default GoogleDocImportsList

