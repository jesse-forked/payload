import type { CollectionConfig } from '../../../../packages/payload/src/collections/config/types'

import { ArrayRowLabel } from './LabelComponent'
import { AddCustomBlocks } from './components/AddCustomBlocks'

export const arrayDefaultValue = [{ text: 'row one' }, { text: 'row two' }]

export const arrayFieldsSlug = 'array-fields'

const ArrayFields: CollectionConfig = {
  slug: arrayFieldsSlug,
  admin: {
    enableRichTextLink: false,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      defaultValue: arrayDefaultValue,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'collapsedArray',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        initCollapsed: true,
      },
    },
    {
      name: 'localized',
      type: 'array',
      required: true,
      localized: true,
      defaultValue: arrayDefaultValue,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      type: 'array',
      name: 'readOnly',
      admin: {
        readOnly: true,
      },
      defaultValue: [
        {
          text: 'defaultValue',
        },
        {
          text: 'defaultValue2',
        },
      ],
      fields: [
        {
          type: 'text',
          name: 'text',
        },
      ],
    },
    {
      type: 'array',
      name: 'potentiallyEmptyArray',
      fields: [
        {
          type: 'text',
          name: 'text',
        },
      ],
    },
    {
      type: 'array',
      name: 'rowLabelAsFunction',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
      ],
      admin: {
        description: 'Row labels rendered from a function.',
        components: {
          RowLabel: ({ data }) => data.title,
        },
      },
    },
    {
      type: 'array',
      name: 'rowLabelAsComponent',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
      ],
      admin: {
        description: 'Row labels rendered as react components.',
        components: {
          RowLabel: ArrayRowLabel,
        },
      },
    },
    {
      name: 'customBlocks',
      type: 'blocks',
      blocks: [
        {
          slug: 'block-1',
          fields: [
            {
              name: 'block1Title',
              type: 'text',
            },
          ],
        },
        {
          slug: 'block-2',
          fields: [
            {
              name: 'block2Title',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      type: 'ui',
      name: 'ui',
      admin: {
        components: {
          Field: AddCustomBlocks,
        },
      },
    },
  ],
}

export const arrayDoc = {
  items: [
    {
      text: 'first row',
    },
    {
      text: 'second row',
    },
    {
      text: 'third row',
    },
    {
      text: 'fourth row',
    },
    {
      text: 'fifth row',
    },
    {
      text: 'sixth row',
    },
  ],
  collapsedArray: [
    {
      text: 'initialize collapsed',
    },
  ],
}

export default ArrayFields
