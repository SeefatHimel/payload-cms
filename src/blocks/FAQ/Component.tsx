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

