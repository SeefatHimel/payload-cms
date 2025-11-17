import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  // Skip static generation if database is not configured
  if (!process.env.DATABASE_URI) {
    return []
  }
  
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    const params = posts.docs.map(({ slug }) => {
      return { slug }
    })

    return params
  } catch (error) {
    // Database not available during build - return empty array
    // Pages will be generated at runtime
    console.warn('Database not available during build, skipping static generation:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  try {
    // Increased timeout for database connection (20 seconds)
    const payload = await Promise.race([
      getPayload({ config: configPromise }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 20000)
      ) as Promise<never>
    ])

    // Increased timeout for query (30 seconds) - Render DB can be slow
    const result = await Promise.race([
      payload.find({
        collection: 'posts',
        draft,
        limit: 1,
        overrideAccess: draft,
        pagination: false,
        where: {
          slug: {
            equals: slug,
          },
        },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 30000)
      ) as Promise<never>
    ])

    return result.docs?.[0] || null
  } catch (error) {
    console.error('[Post Query] Database error:', error)
    
    // Log more details for debugging
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.warn('[Post Query] ⚠️ Query timed out - database may be slow or unreachable')
        console.warn('[Post Query] Consider checking database connection and pool settings')
      } else if (error.message.includes('connection')) {
        console.warn('[Post Query] ⚠️ Database connection issue - check DATABASE_URI and network')
      }
    }
    
    // Return null on error - the page will handle it gracefully
    return null
  }
})
