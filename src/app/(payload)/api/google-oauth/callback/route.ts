import { NextRequest, NextResponse } from 'next/server'
import { getOAuth2Client, storeRefreshToken } from '@/utilities/googleOAuth'
import { getServerSideURL } from '@/utilities/getURL'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.json(
        { error: 'OAuth authorization failed', details: error },
        { status: 400 }
      )
    }

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      )
    }

    const oauth2Client = getOAuth2Client()

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.refresh_token) {
      return NextResponse.json(
        { 
          error: 'No refresh token received',
          note: 'Make sure to set prompt=consent in the OAuth flow. You may need to revoke access and try again.',
        },
        { status: 400 }
      )
    }

    // Store refresh token
    storeRefreshToken(tokens.refresh_token)

    // Redirect to admin - use getServerSideURL() to get the correct URL (Render, Vercel, or localhost)
    const baseUrl = getServerSideURL()
    const adminUrl = `${baseUrl}/admin?google-oauth=success`

    return NextResponse.redirect(adminUrl)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to complete OAuth flow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

