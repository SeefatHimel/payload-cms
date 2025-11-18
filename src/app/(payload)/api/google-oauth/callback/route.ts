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

    // Log token info for debugging
    console.log(`\n=== OAuth Token Received ===`)
    console.log(`Refresh Token: ${tokens.refresh_token.substring(0, 20)}...`)
    console.log(`Access Token: ${tokens.access_token ? 'Received' : 'Not received'}`)
    console.log(`Token Scope: ${tokens.scope || 'Not specified'}`)
    console.log(`Expiry: ${tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'Not specified'}`)
    console.log(`\n⚠️  IMPORTANT: Copy the refresh token above and add it to your .env file as GOOGLE_REFRESH_TOKEN`)
    console.log(`⚠️  Then RESTART your server for the changes to take effect!\n`)

    // Redirect to admin - use getServerSideURL() to get the correct URL (Render, Vercel, or localhost)
    const baseUrl = getServerSideURL()
    const adminUrl = `${baseUrl}/admin?google-oauth=success&token-updated=true`

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

