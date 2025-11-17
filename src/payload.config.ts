// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { GoogleDocImports } from './collections/GoogleDocImports'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: (() => {
    const dbUri = process.env.DATABASE_URI || ''
    console.log('[DB Config] Initializing database connection...')
    console.log('[DB Config] Connection string:', dbUri ? `${dbUri.substring(0, 30)}...` : 'NOT SET')
    console.log('[DB Config] Is Supabase:', dbUri.includes('supabase.com'))
    console.log('[DB Config] Is Render:', dbUri.includes('render.com'))
    
    return postgresAdapter({
      pool: {
        connectionString: dbUri,
        // Automatically configure SSL based on database provider
        // Supabase and Render both require SSL for external connections
        ssl: (() => {
          // Enable SSL for Supabase (pooler or direct) and Render databases
          if (dbUri.includes('supabase.com') || dbUri.includes('render.com')) {
            console.log('[DB Config] Using SSL with rejectUnauthorized: false')
            return { rejectUnauthorized: false }
          }
          console.log('[DB Config] No SSL configured')
          return undefined
        })(),
        // Connection pool settings for better resilience
        max: 10, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 30000, // Wait 30 seconds for connection (increased for slow Render DB)
        // Retry connection on failure
        allowExitOnIdle: false, // Keep pool alive
      },
      // Disable automatic schema changes to prevent migration conflicts
      // Use migrations instead: pnpm payload migrate:create and pnpm payload migrate
      push: false,
    })
  })(),
  collections: [Pages, Posts, Media, Categories, Users, GoogleDocImports],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
