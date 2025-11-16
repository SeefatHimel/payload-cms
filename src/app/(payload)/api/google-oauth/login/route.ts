import { NextResponse } from 'next/server'
import { getOAuth2Client } from '@/utilities/googleOAuth'

export async function GET(): Promise<NextResponse> {
  try {
    const oauth2Client = getOAuth2Client()

    const SCOPES = [
      'https://www.googleapis.com/auth/documents.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ]

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to get refresh token
      scope: SCOPES,
      prompt: 'consent', // Force consent screen to get refresh token
    })

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('OAuth login error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

