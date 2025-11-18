import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export async function GET(request: NextRequest): Promise<NextResponse> {
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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const result = await payload.find({
      collection: 'google-doc-imports',
      limit,
      page,
      sort: '-updatedAt',
      depth: 1, // Populate relationships
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching imports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch imports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

