import { NextResponse } from 'next/server'
import { getOAuth2Client } from '@/utilities/googleOAuth'

/**
 * Debug endpoint to check OAuth configuration
 * Visit: /api/google-oauth/debug
 */
export async function GET(): Promise<NextResponse> {
  try {
    const oauth2Client = getOAuth2Client()
    
    // Get the redirect URI from the client
    const redirectUri = (oauth2Client as any).redirectUri_ || 
                       process.env.GOOGLE_REDIRECT_URL || 
                       `${process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/google-oauth/callback`

    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    
    return NextResponse.json({
      message: 'OAuth Configuration Debug Info',
      redirectUri: redirectUri,
      clientId: CLIENT_ID ? `${CLIENT_ID.substring(0, 20)}...` : 'NOT SET',
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      serverUrl: process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      instructions: {
        step1: 'Go to Google Cloud Console → APIs & Services → Credentials',
        step2: 'Click on your OAuth 2.0 Client ID',
        step3: `Add this EXACT redirect URI to "Authorized redirect URIs":`,
        redirectUri: redirectUri,
        step4: 'Make sure there are NO trailing slashes',
        step5: 'Click SAVE',
        step6: 'Try the OAuth flow again'
      }
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get OAuth config',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

