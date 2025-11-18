/**
 * Google OAuth Token Storage Utility
 * 
 * This utility manages Google OAuth refresh tokens.
 * In production, you should use a database or secure storage.
 * For now, we'll use environment variables.
 */

import { google } from 'googleapis'
import { getServerSideURL } from './getURL'

export interface GoogleTokens {
  refreshToken: string
  accessToken?: string
  expiryDate?: number
}

/**
 * Get stored refresh token from environment variable
 */
export function getRefreshToken(): string | null {
  return process.env.GOOGLE_REFRESH_TOKEN || null
}

/**
 * Store refresh token (in production, use database)
 * For now, we'll just return it - you should manually add it to .env
 */
export function storeRefreshToken(refreshToken: string): void {
  // In production, store in database
  // For now, log it so user can add to .env
  console.log(`\n=== IMPORTANT: Add this to your .env file ===`)
  console.log(`GOOGLE_REFRESH_TOKEN=${refreshToken}\n`)
}

/**
 * Get OAuth2 client configuration
 */
export function getOAuth2Client() {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables')
  }
  
  // Determine redirect URL - use GOOGLE_REDIRECT_URL if set, otherwise construct from server URL
  // This will use NEXT_PUBLIC_SERVER_URL in production (e.g., Render) or localhost in development
  const baseUrl = getServerSideURL()
  const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL || `${baseUrl}/api/google-oauth/callback`
  
  // Log for debugging - shows what URL is being used
  console.log('[OAuth Debug] Base URL:', baseUrl)
  console.log('[OAuth Debug] Redirect URI being used:', REDIRECT_URL)
  console.log('[OAuth Debug] NEXT_PUBLIC_SERVER_URL:', process.env.NEXT_PUBLIC_SERVER_URL || 'not set')
  console.log('[OAuth Debug] RENDER_EXTERNAL_URL:', process.env.RENDER_EXTERNAL_URL || 'not set')
  
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
}

/**
 * Get access token using refresh token
 */
export async function getAccessToken(): Promise<string> {
  const oauth2Client = getOAuth2Client()
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('No refresh token found. Please complete OAuth flow first by visiting /api/google-oauth/login')
  }

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  try {
    const { credentials } = await oauth2Client.refreshAccessToken()
    if (!credentials.access_token) {
      throw new Error('No access token received from refresh')
    }

    // Log token info for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth] Access token refreshed successfully')
      if (credentials.scope) {
        console.log('[OAuth] Token scopes:', credentials.scope)
        const hasDriveFile = credentials.scope.includes('drive.file')
        const hasDriveReadonly = credentials.scope.includes('drive.readonly')
        console.log('[OAuth] Has drive.file scope:', hasDriveFile ? '✅' : '❌')
        console.log('[OAuth] Has drive.readonly scope:', hasDriveReadonly ? '✅' : '❌')
        if (!hasDriveFile) {
          console.warn('[OAuth] ⚠️  Missing drive.file scope - Word document conversion will fail!')
          console.warn('[OAuth] ⚠️  Please re-authenticate at /api/google-oauth/login')
        }
      }
    }

    return credentials.access_token
  } catch (error) {
    throw new Error(`Failed to refresh access token: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

