/**
 * Google OAuth Token Storage Utility
 * 
 * This utility manages Google OAuth refresh tokens.
 * In production, you should use a database or secure storage.
 * For now, we'll use environment variables.
 */

import { google } from 'googleapis'

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
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL || `${baseUrl}/api/google-oauth/callback`
  
  // Log for debugging (remove in production)
  console.log('[OAuth Debug] Redirect URI being used:', REDIRECT_URL)
  
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
    return credentials.access_token
  } catch (error) {
    throw new Error(`Failed to refresh access token: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

