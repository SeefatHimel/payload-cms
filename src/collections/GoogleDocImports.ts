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


