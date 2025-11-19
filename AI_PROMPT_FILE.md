# Payload CMS AI Generation Prompt File

**Generated:** 2025-11-18T09:41:01.442Z
**Purpose:** This file contains all necessary information for AI to generate Payload CMS compatible posts with blocks.

---

## 📋 INSTRUCTIONS FOR AI

You are tasked with generating Payload CMS post data that includes custom blocks (especially FAQ blocks).

### Your Task:
1. Generate a complete Payload CMS post structure in JSON format
2. Include FAQ blocks embedded in the richText content field
3. Use the exact structure shown in the examples below
4. Follow the block schemas exactly as defined

### Output Format:
- JSON format matching `sample-payload-seed-data.json` structure
- OR API response format matching `sample-payload-api-response.json` structure
- Both formats are acceptable, but seed data format is preferred for creation

### Key Requirements:
1. **FAQ Blocks**: Must be embedded in `content.root.children` as `type: "block"` nodes
2. **Block Type**: Must use `blockType: "faq"` exactly
3. **Lexical Format**: All richText fields must use Lexical editor format (see examples)
4. **Required Fields**: FAQ items must have `question` (text) and `answer` (Lexical format)
5. **Optional Fields**: FAQ block can have optional `title` field

---

## 🧩 BLOCK SCHEMAS

### FAQ Block Schema

```typescript
import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'FAQ Section Title',
      admin: {
        description: 'Optional title for the FAQ section (e.g., "Frequently Asked Questions")',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'FAQ Items',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Question',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          label: 'Answer',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                FixedToolbarFeature(),
                InlineToolbarFeature(),
              ]
            },
          }),
          required: true,
        },
      ],
    },
  ],
  labels: {
    plural: 'FAQs',
    singular: 'FAQ',
  },
}


```

### All Available Blocks


#### ArchiveBlock Block
```typescript
import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Individual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: 'Collections To Show',
      options: [
        {
          label: 'Posts',
          value: 'posts',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Limit',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: ['posts'],
    },
  ],
  labels: {
    plural: 'Archives',
    singular: 'Archive',
  },
}

```


#### Banner Block
```typescript
import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Banner: Block = {
  slug: 'banner',
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
        { label: 'Success', value: 'success' },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      label: false,
      required: true,
    },
  ],
  interfaceName: 'BannerBlock',
}

```


#### CallToAction Block
```typescript
import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'

export const CallToAction: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  fields: [
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
  ],
  labels: {
    plural: 'Calls to Action',
    singular: 'Call to Action',
  },
}

```


#### Code Block
```typescript
import type { Block } from 'payload'

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'typescript',
      options: [
        {
          label: 'Typescript',
          value: 'typescript',
        },
        {
          label: 'Javascript',
          value: 'javascript',
        },
        {
          label: 'CSS',
          value: 'css',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
    },
  ],
}

```


#### Content Block
```typescript
import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'One Third',
        value: 'oneThird',
      },
      {
        label: 'Half',
        value: 'half',
      },
      {
        label: 'Two Thirds',
        value: 'twoThirds',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}

```


#### FAQ Block
```typescript
import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'FAQ Section Title',
      admin: {
        description: 'Optional title for the FAQ section (e.g., "Frequently Asked Questions")',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'FAQ Items',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Question',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          label: 'Answer',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                FixedToolbarFeature(),
                InlineToolbarFeature(),
              ]
            },
          }),
          required: true,
        },
      ],
    },
  ],
  labels: {
    plural: 'FAQs',
    singular: 'FAQ',
  },
}


```


#### Form Block
```typescript
import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Enable Intro Content',
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Form Blocks',
    singular: 'Form Block',
  },
}

```


#### MediaBlock Block
```typescript
import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}

```


---

## 📚 COLLECTION SCHEMAS

### Posts Collection (Where FAQ blocks are used)

```typescript
import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { FAQ } from '../../blocks/FAQ/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures, // rootFeatures may include table support if available
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock, FAQ] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

```

### All Collections


#### Categories Collection
```typescript
import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}

```


#### GoogleDocImports Collection
```typescript
import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const GoogleDocImports: CollectionConfig = {
  slug: 'google-doc-imports',
  labels: {
    plural: 'Google Docs',
    singular: 'Google Doc',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'googleDocId', 'lastSyncedAt', 'status', 'updatedAt'],
    description: 'Import, sync, and manage all your Google Docs. Use the management page at /admin/google-docs for importing.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'googleDocId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'The Google Doc ID from the URL',
      },
    },
    {
      name: 'googleDocUrl',
      type: 'text',
      admin: {
        description: 'Full Google Doc URL (optional, for reference)',
      },
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      admin: {
        description: 'The Payload CMS post created from this Google Doc',
      },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When this document was last synced/imported',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Error', value: 'error' },
        { label: 'Syncing', value: 'syncing' },
      ],
      defaultValue: 'active',
      required: true,
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        description: 'Error message if sync failed',
        condition: (data) => data.status === 'error',
      },
    },
    {
      name: 'imagesCount',
      type: 'number',
      admin: {
        description: 'Number of images imported',
      },
    },
    {
      name: 'useAI',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Use AI formatting when syncing this document',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          // Auto-update lastSyncedAt when status changes to active
          if (data.status === 'active' && !data.lastSyncedAt) {
            data.lastSyncedAt = new Date().toISOString()
          }
        }
        return data
      },
    ],
  },
}



```


#### Media Collection
```typescript
import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}

```


#### Pages Collection
```typescript
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

```


#### Posts Collection
```typescript
import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { FAQ } from '../../blocks/FAQ/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures, // rootFeatures may include table support if available
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock, FAQ] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

```


#### Users Collection
```typescript
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}

```


---

## 🔧 FIELD UTILITIES

### Link Field (used in multiple blocks)

```typescript
import type { Field, GroupField } from 'payload'

import deepMerge from '@/utilities/deepMerge'

export type LinkAppearances = 'default' | 'outline'

export const appearanceOptions: Record<LinkAppearances, { label: string; value: string }> = {
  default: {
    label: 'Default',
    value: 'default',
  },
  outline: {
    label: 'Outline',
    value: 'outline',
  },
}

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false
  disableLabel?: boolean
  overrides?: Partial<GroupField>
}) => Field

export const link: LinkType = ({ appearances, disableLabel = false, overrides = {} } = {}) => {
  const linkResult: GroupField = {
    name: 'link',
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            options: [
              {
                label: 'Internal link',
                value: 'reference',
              },
              {
                label: 'Custom URL',
                value: 'custom',
              },
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              width: '50%',
            },
            label: 'Open in new tab',
          },
        ],
      },
    ],
  }

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
      label: 'Document to link to',
      relationTo: ['pages', 'posts'],
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
      label: 'Custom URL',
      required: true,
    },
  ]

  if (!disableLabel) {
    linkTypes.map((linkType) => ({
      ...linkType,
      admin: {
        ...linkType.admin,
        width: '50%',
      },
    }))

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypes,
        {
          name: 'label',
          type: 'text',
          admin: {
            width: '50%',
          },
          label: 'Label',
          required: true,
        },
      ],
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = [appearanceOptions.default, appearanceOptions.outline]

    if (appearances) {
      appearanceOptionsToUse = appearances.map((appearance) => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      name: 'appearance',
      type: 'select',
      admin: {
        description: 'Choose how the link should be rendered.',
      },
      defaultValue: 'default',
      options: appearanceOptionsToUse,
    })
  }

  return deepMerge(linkResult, overrides)
}

```

### Link Group Field (used in multiple blocks)

```typescript
import type { ArrayField, Field } from 'payload'

import type { LinkAppearances } from './link'

import deepMerge from '@/utilities/deepMerge'
import { link } from './link'

type LinkGroupType = (options?: {
  appearances?: LinkAppearances[] | false
  overrides?: Partial<ArrayField>
}) => Field

export const linkGroup: LinkGroupType = ({ appearances, overrides = {} } = {}) => {
  const generatedLinkGroup: Field = {
    name: 'links',
    type: 'array',
    fields: [
      link({
        appearances,
      }),
    ],
    admin: {
      initCollapsed: true,
    },
  }

  return deepMerge(generatedLinkGroup, overrides)
}

```

### Default Lexical Editor Config

```typescript
import type { TextFieldSingleValidation } from 'payload'
import {
  LinkFeature,
  lexicalEditor,
  type LinkFields,
} from '@payloadcms/richtext-lexical'

export const defaultLexical = lexicalEditor({
  features: ({ rootFeatures }) => {
    return [
      ...rootFeatures, // Includes lists, paragraphs, bold, italic, underline, and other default features
      LinkFeature({
      enabledCollections: ['pages', 'posts'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false
          return true
        })

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true // no validation needed, as no url should exist for internal links
              }
              return value ? true : 'URL is required'
            }) as TextFieldSingleValidation,
          },
        ]
      },
    })
    ]
  },
})

```

---

## 📝 EXAMPLE STRUCTURES

### Example 1: Seed Data Format (Preferred for Creation)

```json
{
  "description": "Sample Payload CMS seed data for a blog post with FAQ blocks. This demonstrates the exact structure needed to create posts with embedded blocks in the richText content field.",
  "post": {
    "title": "Getting Started with Payload CMS: A Complete Guide",
    "slug": "getting-started-with-payload-cms",
    "_status": "published",
    "heroImage": "{{MEDIA_ID}}",
    "authors": ["{{USER_ID}}"],
    "categories": ["{{CATEGORY_ID}}"],
    "publishedAt": "2025-01-18T12:00:00.000Z",
    "content": {
      "root": {
        "type": "root",
        "children": [
          {
            "type": "heading",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Introduction to Payload CMS",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "tag": "h2",
            "version": 1
          },
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Payload CMS is a powerful headless content management system built with TypeScript. It provides a flexible and developer-friendly way to manage content for modern web applications.",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "textFormat": 0,
            "version": 1
          },
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "In this comprehensive guide, we'll explore the key features and best practices for working with Payload CMS, including how to use blocks for dynamic content creation.",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "textFormat": 0,
            "version": 1
          },
          {
            "type": "heading",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Key Features",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "tag": "h2",
            "version": 1
          },
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Payload CMS offers several powerful features that make it an excellent choice for modern web development:",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "textFormat": 0,
            "version": 1
          },
          {
            "type": "list",
            "listType": "bullet",
            "children": [
              {
                "type": "listitem",
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "TypeScript-first architecture",
                    "version": 1
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "value": 1,
                "version": 1
              },
              {
                "type": "listitem",
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Flexible content blocks system",
                    "version": 1
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "value": 2,
                "version": 1
              },
              {
                "type": "listitem",
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Built-in authentication and access control",
                    "version": 1
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "value": 3,
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "version": 1
          },
          {
            "type": "block",
            "fields": {
              "blockType": "faq",
              "title": "Frequently Asked Questions",
              "items": [
                {
                  "question": "What is Payload CMS?",
                  "answer": {
                    "root": {
                      "type": "root",
                      "children": [
                        {
                          "type": "paragraph",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "Payload CMS is a headless content management system built with TypeScript and Node.js. It provides a self-hosted, API-first solution for managing content with a powerful admin panel and flexible data modeling capabilities.",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "textFormat": 0,
                          "version": 1
                        }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "version": 1
                    }
                  }
                },
                {
                  "question": "How do I install Payload CMS?",
                  "answer": {
                    "root": {
                      "type": "root",
                      "children": [
                        {
                          "type": "paragraph",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "You can install Payload CMS using npm or yarn. The easiest way is to use the official CLI:",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "textFormat": 0,
                          "version": 1
                        },
                        {
                          "type": "code",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "npx create-payload-app@latest my-app",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "language": "bash",
                          "version": 1
                        }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "version": 1
                    }
                  }
                },
                {
                  "question": "Can I use custom blocks in Payload CMS?",
                  "answer": {
                    "root": {
                      "type": "root",
                      "children": [
                        {
                          "type": "paragraph",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "Yes! Payload CMS supports custom blocks through its rich text editor. You can create custom blocks like FAQ blocks, banner blocks, code blocks, and more. Each block can have its own fields and React component for rendering.",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "textFormat": 0,
                          "version": 1
                        }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "version": 1
                    }
                  }
                },
                {
                  "question": "What databases does Payload CMS support?",
                  "answer": {
                    "root": {
                      "type": "root",
                      "children": [
                        {
                          "type": "paragraph",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "Payload CMS supports multiple databases including MongoDB, PostgreSQL, and SQLite. You can choose the database adapter that best fits your project requirements.",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "textFormat": 0,
                          "version": 1
                        }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "version": 1
                    }
                  }
                }
              ]
            },
            "format": "",
            "version": 2
          },
          {
            "type": "heading",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Conclusion",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "tag": "h2",
            "version": 1
          },
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Payload CMS is a powerful and flexible solution for managing content in modern web applications. With its TypeScript-first approach, flexible block system, and comprehensive feature set, it's an excellent choice for developers who want full control over their content management system.",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "textFormat": 0,
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "version": 1
      }
    },
    "meta": {
      "title": "Getting Started with Payload CMS: A Complete Guide",
      "description": "Learn everything you need to know about Payload CMS, including installation, features, and how to use custom blocks like FAQ blocks.",
      "image": "{{MEDIA_ID}}"
    }
  },
  "notes": {
    "placeholders": {
      "{{MEDIA_ID}}": "Replace with actual media document ID from your media collection",
      "{{USER_ID}}": "Replace with actual user document ID from your users collection",
      "{{CATEGORY_ID}}": "Replace with actual category document ID from your categories collection"
    },
    "blockStructure": {
      "faq": {
        "blockType": "faq",
        "title": "Optional - FAQ section title",
        "items": [
          {
            "question": "Required - The question text",
            "answer": {
              "root": {
                "type": "root",
                "children": [
                  {
                    "type": "paragraph",
                    "children": [
                      {
                        "type": "text",
                        "text": "Answer content in Lexical format"
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]
      }
    },
    "usage": "This JSON structure can be used directly with Payload CMS API or seed scripts. The content field uses Lexical editor format, and blocks are embedded as 'block' type nodes within the richText content."
  }
}


```

### Example 2: API Response Format (What Payload Returns)

```json
{
  "description": "Sample Payload CMS API response for a post with FAQ blocks. This shows what the API returns when you fetch a post with depth=1 or depth=2.",
  "apiResponse": {
    "id": 1,
    "title": "Getting Started with Payload CMS: A Complete Guide",
    "slug": "getting-started-with-payload-cms",
    "_status": "published",
    "createdAt": "2025-01-18T12:00:00.000Z",
    "updatedAt": "2025-01-18T12:00:00.000Z",
    "publishedAt": "2025-01-18T12:00:00.000Z",
    "heroImage": {
      "id": 1,
      "alt": "Payload CMS hero image",
      "url": "/media/payload-cms-hero.jpg",
      "filename": "payload-cms-hero.jpg",
      "mimeType": "image/jpeg",
      "filesize": 125000,
      "width": 1920,
      "height": 1080,
      "focalX": 50,
      "focalY": 50,
      "createdAt": "2025-01-18T11:00:00.000Z",
      "updatedAt": "2025-01-18T11:00:00.000Z"
    },
    "authors": [
      {
        "id": 1,
        "name": "Demo Author",
        "email": "demo-author@example.com",
        "createdAt": "2025-01-18T10:00:00.000Z",
        "updatedAt": "2025-01-18T10:00:00.000Z"
      }
    ],
    "categories": [
      {
        "id": 1,
        "title": "Technology",
        "slug": "technology",
        "createdAt": "2025-01-18T10:00:00.000Z",
        "updatedAt": "2025-01-18T10:00:00.000Z"
      }
    ],
    "content": {
      "root": {
        "type": "root",
        "children": [
          {
            "type": "heading",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Introduction to Payload CMS",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "tag": "h2",
            "version": 1
          },
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Payload CMS is a powerful headless content management system built with TypeScript. It provides a flexible and developer-friendly way to manage content for modern web applications.",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "textFormat": 0,
            "version": 1
          },
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "In this comprehensive guide, we'll explore the key features and best practices for working with Payload CMS, including how to use blocks for dynamic content creation.",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "textFormat": 0,
            "version": 1
          },
          {
            "type": "block",
            "fields": {
              "blockType": "faq",
              "title": "Frequently Asked Questions",
              "items": [
                {
                  "id": "faq-item-1",
                  "question": "What is Payload CMS?",
                  "answer": {
                    "root": {
                      "type": "root",
                      "children": [
                        {
                          "type": "paragraph",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "Payload CMS is a headless content management system built with TypeScript and Node.js. It provides a self-hosted, API-first solution for managing content with a powerful admin panel and flexible data modeling capabilities.",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "textFormat": 0,
                          "version": 1
                        }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "version": 1
                    }
                  }
                },
                {
                  "id": "faq-item-2",
                  "question": "How do I install Payload CMS?",
                  "answer": {
                    "root": {
                      "type": "root",
                      "children": [
                        {
                          "type": "paragraph",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "You can install Payload CMS using npm or yarn. The easiest way is to use the official CLI:",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "textFormat": 0,
                          "version": 1
                        },
                        {
                          "type": "code",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "npx create-payload-app@latest my-app",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "language": "bash",
                          "version": 1
                        }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "version": 1
                    }
                  }
                },
                {
                  "id": "faq-item-3",
                  "question": "Can I use custom blocks in Payload CMS?",
                  "answer": {
                    "root": {
                      "type": "root",
                      "children": [
                        {
                          "type": "paragraph",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "Yes! Payload CMS supports custom blocks through its rich text editor. You can create custom blocks like FAQ blocks, banner blocks, code blocks, and more. Each block can have its own fields and React component for rendering.",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "textFormat": 0,
                          "version": 1
                        }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "version": 1
                    }
                  }
                },
                {
                  "id": "faq-item-4",
                  "question": "What databases does Payload CMS support?",
                  "answer": {
                    "root": {
                      "type": "root",
                      "children": [
                        {
                          "type": "paragraph",
                          "children": [
                            {
                              "type": "text",
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "Payload CMS supports multiple databases including MongoDB, PostgreSQL, and SQLite. You can choose the database adapter that best fits your project requirements.",
                              "version": 1
                            }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "textFormat": 0,
                          "version": 1
                        }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "version": 1
                    }
                  }
                }
              ]
            },
            "format": "",
            "version": 2
          },
          {
            "type": "heading",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Conclusion",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "tag": "h2",
            "version": 1
          },
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Payload CMS is a powerful and flexible solution for managing content in modern web applications. With its TypeScript-first approach, flexible block system, and comprehensive feature set, it's an excellent choice for developers who want full control over their content management system.",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "textFormat": 0,
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "version": 1
      }
    },
    "meta": {
      "title": "Getting Started with Payload CMS: A Complete Guide",
      "description": "Learn everything you need to know about Payload CMS, including installation, features, and how to use custom blocks like FAQ blocks.",
      "image": {
        "id": 1,
        "alt": "Payload CMS hero image",
        "url": "/media/payload-cms-hero.jpg",
        "filename": "payload-cms-hero.jpg",
        "mimeType": "image/jpeg",
        "filesize": 125000,
        "width": 1920,
        "height": 1080,
        "focalX": 50,
        "focalY": 50,
        "createdAt": "2025-01-18T11:00:00.000Z",
        "updatedAt": "2025-01-18T11:00:00.000Z"
      }
    },
    "relatedPosts": [],
    "populatedAuthors": [
      {
        "id": "1",
        "name": "Demo Author"
      }
    ]
  },
  "apiEndpoints": {
    "getPost": "GET /api/posts/{id}?depth=1",
    "getPostBySlug": "GET /api/posts/slug/{slug}?depth=1",
    "getAllPosts": "GET /api/posts?depth=1&where[_status][equals]=published"
  },
  "notes": {
    "depth": "Use depth=1 or depth=2 to populate relationships (authors, categories, media, etc.)",
    "status": "Only published posts are returned by default unless you're authenticated",
    "faqBlock": "The FAQ block is embedded in the content.root.children array as a 'block' type node",
    "relationships": "With depth=1, relationships like heroImage, authors, and categories are populated with full objects instead of just IDs"
  }
}


```

### Example 3: FAQ Block Reference (Simplified)

```json
{
  "description": "Reference structure for FAQ blocks in Payload CMS richText content",
  "faqBlockStructure": {
    "type": "block",
    "fields": {
      "blockType": "faq",
      "title": "Frequently Asked Questions",
      "items": [
        {
          "question": "What is Payload CMS?",
          "answer": {
            "root": {
              "type": "root",
              "children": [
                {
                  "type": "paragraph",
                  "children": [
                    {
                      "type": "text",
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Payload CMS is a headless content management system built with TypeScript and Node.js.",
                      "version": 1
                    }
                  ],
                  "direction": "ltr",
                  "format": "",
                  "indent": 0,
                  "textFormat": 0,
                  "version": 1
                }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "version": 1
            }
          }
        }
      ]
    },
    "format": "",
    "version": 2
  },
  "minimalFAQBlock": {
    "type": "block",
    "fields": {
      "blockType": "faq",
      "items": [
        {
          "question": "Question text here",
          "answer": {
            "root": {
              "type": "root",
              "children": [
                {
                  "type": "paragraph",
                  "children": [
                    {
                      "type": "text",
                      "text": "Answer text here",
                      "version": 1
                    }
                  ],
                  "version": 1
                }
              ],
              "version": 1
            }
          }
        }
      ]
    },
    "version": 2
  },
  "notes": {
    "requiredFields": {
      "blockType": "Must be 'faq'",
      "items": "Array of FAQ items, at least one required",
      "items[].question": "Required text field",
      "items[].answer": "Required richText field in Lexical format"
    },
    "optionalFields": {
      "title": "Optional FAQ section title"
    },
    "answerFormat": "The answer field must be a Lexical editor state object with root type and children array"
  }
}


```

### Example 4: Complete Block Schema Reference

```json
{
  "blocks": [
    {
      "slug": "faq",
      "interfaceName": "FAQBlock",
      "fields": [
        {
          "name": "title",
          "type": "text",
          "label": "FAQ Section Title",
          "admin": {
            "description": "Optional title for the FAQ section (e.g., \"Frequently Asked Questions\")"
          }
        },
        {
          "name": "items",
          "type": "array",
          "label": "FAQ Items",
          "minRows": 1,
          "required": true,
          "fields": [
            {
              "name": "question",
              "type": "text",
              "label": "Question",
              "required": true
            },
            {
              "name": "answer",
              "type": "richText",
              "label": "Answer",
              "required": true,
              "editor": {
                "type": "lexical",
                "features": [
                  "rootFeatures",
                  "FixedToolbarFeature",
                  "InlineToolbarFeature"
                ]
              }
            }
          ]
        }
      ],
      "labels": {
        "plural": "FAQs",
        "singular": "FAQ"
      }
    },
    {
      "slug": "banner",
      "interfaceName": "BannerBlock",
      "fields": [
        {
          "name": "style",
          "type": "select",
          "defaultValue": "info",
          "options": [
            {
              "label": "Info",
              "value": "info"
            },
            {
              "label": "Warning",
              "value": "warning"
            },
            {
              "label": "Error",
              "value": "error"
            },
            {
              "label": "Success",
              "value": "success"
            }
          ],
          "required": true
        },
        {
          "name": "content",
          "type": "richText",
          "label": false,
          "required": true,
          "editor": {
            "type": "lexical",
            "features": [
              "rootFeatures",
              "FixedToolbarFeature",
              "InlineToolbarFeature"
            ]
          }
        }
      ]
    },
    {
      "slug": "code",
      "interfaceName": "CodeBlock",
      "fields": [
        {
          "name": "language",
          "type": "select",
          "defaultValue": "typescript",
          "options": [
            {
              "label": "Typescript",
              "value": "typescript"
            },
            {
              "label": "Javascript",
              "value": "javascript"
            },
            {
              "label": "CSS",
              "value": "css"
            }
          ]
        },
        {
          "name": "code",
          "type": "code",
          "label": false,
          "required": true
        }
      ]
    },
    {
      "slug": "mediaBlock",
      "interfaceName": "MediaBlock",
      "fields": [
        {
          "name": "media",
          "type": "upload",
          "relationTo": "media",
          "required": true
        }
      ]
    },
    {
      "slug": "cta",
      "interfaceName": "CallToActionBlock",
      "fields": [
        {
          "name": "richText",
          "type": "richText",
          "label": false,
          "editor": {
            "type": "lexical",
            "features": [
              "rootFeatures",
              "HeadingFeature",
              "FixedToolbarFeature",
              "InlineToolbarFeature"
            ],
            "headingSizes": ["h1", "h2", "h3", "h4"]
          }
        },
        {
          "name": "links",
          "type": "array",
          "admin": {
            "initCollapsed": true
          },
          "maxRows": 2,
          "fields": [
            {
              "name": "link",
              "type": "group",
              "admin": {
                "hideGutter": true
              },
              "fields": [
                {
                  "type": "row",
                  "fields": [
                    {
                      "name": "type",
                      "type": "radio",
                      "admin": {
                        "layout": "horizontal",
                        "width": "50%"
                      },
                      "defaultValue": "reference",
                      "options": [
                        {
                          "label": "Internal link",
                          "value": "reference"
                        },
                        {
                          "label": "Custom URL",
                          "value": "custom"
                        }
                      ]
                    },
                    {
                      "name": "newTab",
                      "type": "checkbox",
             ...
```

---

## 🎨 FRONTEND COMPONENT (How FAQ Blocks Are Rendered)

```tsx
import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/utilities/ui'

export const FAQBlock: React.FC<FAQBlockProps> = ({ title, items }) => {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className={cn('container my-8')}>
      {title && (
        <h2 className="mb-6 text-3xl font-bold">{title}</h2>
      )}
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => {
          if (!item.question || !item.answer) return null
          
          return (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <RichText data={item.answer} enableGutter={false} enableProse={false} />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}


```

**Note:** This shows how FAQ blocks are rendered on the frontend. The component expects:
- `title` (optional): FAQ section title
- `items`: Array of FAQ items with `question` and `answer` (Lexical format)

---

## ✅ VALIDATION CHECKLIST

Before generating, ensure your output:

- [ ] Uses Lexical editor format for all richText fields
- [ ] Embeds FAQ blocks as `type: "block"` nodes in `content.root.children`
- [ ] Uses `blockType: "faq"` exactly (lowercase)
- [ ] Includes required fields: `items` array with at least one item
- [ ] Each FAQ item has `question` (text) and `answer` (Lexical format)
- [ ] Follows the structure from `sample-payload-seed-data.json`
- [ ] All text nodes have required properties: `type`, `text`, `version`, `detail`, `format`, `mode`, `style`
- [ ] All paragraph/heading nodes have: `type`, `children`, `direction`, `format`, `indent`, `version`

---

## 🚀 USAGE EXAMPLE

### Prompt to AI:
```
Generate a Payload CMS blog post about "Getting Started with TypeScript" 
with 5 FAQ items. Use the structure from the examples provided.
```

### Expected Output:
- A complete JSON object matching `sample-payload-seed-data.json` structure
- FAQ block embedded in the content with 5 items
- All richText fields in Lexical format
- Proper nesting and structure

---

## 📌 IMPORTANT NOTES

1. **Block Location**: FAQ blocks are embedded in the `content` field's Lexical editor state, NOT as separate fields
2. **Relationship IDs**: In seed data format, use IDs (numbers or strings). In API response format, relationships are populated objects
3. **Lexical Format**: Always use the full Lexical format with all required properties - don't simplify
4. **Block Type**: Must match the block slug exactly (e.g., "faq", "banner", "code", "mediaBlock")
5. **Version Numbers**: Include `version: 1` for text nodes, `version: 2` for block nodes

---

## 🔄 AUTO-UPDATE

This file is automatically generated. To regenerate:
```bash
npx tsx scripts/generate-ai-prompt-file.ts
```

Or add to package.json:
```json
{
  "scripts": {
    "generate-ai-prompt": "tsx scripts/generate-ai-prompt-file.ts"
  }
}
```

---

**Last Updated:** 2025-11-18T09:41:01.442Z
**Generated by:** generate-ai-prompt-file.ts
