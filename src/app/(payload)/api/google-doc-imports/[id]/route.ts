import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate user
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  try {
    const { id } = params
    const body = await request.json()

    const result = await payload.update({
      collection: 'google-doc-imports',
      id: parseInt(id),
      data: body,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating import:', error)
    return NextResponse.json(
      { error: 'Failed to update import', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


