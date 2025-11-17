import type { CollectionSlug, PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import configPromise from '@payload-config'

export async function GET(req: NextRequest): Promise<Response> {
  let payload
  
  try {
    // Get payload with timeout handling
    payload = await Promise.race([
      getPayload({ config: configPromise }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 15000)
      ) as Promise<never>
    ])
  } catch (error) {
    console.error('[Preview] Database connection error:', error)
    return new Response(
      'Database connection failed. Please try again in a moment.',
      { status: 503 }
    )
  }

  const { searchParams } = new URL(req.url)

  const path = searchParams.get('path')
  const collection = searchParams.get('collection') as CollectionSlug
  const slug = searchParams.get('slug')
  const previewSecret = searchParams.get('previewSecret')
  const expectedSecret = process.env.PREVIEW_SECRET

  // Require PREVIEW_SECRET to be set in production
  if (!expectedSecret) {
    payload.logger.error('PREVIEW_SECRET environment variable is not set')
    return new Response('Preview is not configured. Please set PREVIEW_SECRET environment variable.', { status: 500 })
  }

  if (previewSecret !== expectedSecret) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  if (!path || !collection || !slug) {
    return new Response('Insufficient search params', { status: 404 })
  }

  if (!path.startsWith('/')) {
    return new Response('This endpoint can only be used for relative previews', { status: 500 })
  }

  let user

  try {
    // Add timeout for auth check as well
    user = await Promise.race([
      payload.auth({
        req: req as unknown as PayloadRequest,
        headers: req.headers,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 10000)
      ) as Promise<never>
    ])
  } catch (error) {
    console.error('[Preview] Auth error:', error)
    payload.logger.error({ err: error }, 'Error verifying token for live preview')
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  const draft = await draftMode()

  if (!user) {
    draft.disable()
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  // You can add additional checks here to see if the user is allowed to preview this page

  draft.enable()

  redirect(path)
}
