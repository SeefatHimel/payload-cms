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

