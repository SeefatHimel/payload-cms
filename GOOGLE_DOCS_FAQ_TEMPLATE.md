# Google Docs FAQ Template

Use this template structure in your Google Doc to automatically create FAQ blocks when importing to Payload CMS.

## Structure

The parser will detect FAQ sections by looking for these keywords in headings:
- "FAQ"
- "Frequently Asked Questions"
- "Questions and Answers"
- "Q&A"
- "FAQs"

## Template Format

### Option 1: Heading-based (Recommended)

```
FAQ
(or Frequently Asked Questions, Q&A, etc.)

What is Payload CMS?
Payload CMS is a headless CMS built with Node.js and TypeScript. It provides a powerful admin panel and flexible content management system.

How do I install Payload CMS?
You can install Payload CMS using npm, yarn, or pnpm. Run: npm install payload

Can I use Payload CMS with Next.js?
Yes! Payload CMS works great with Next.js. There are official templates and examples available.

What databases does Payload CMS support?
Payload CMS supports PostgreSQL, MongoDB, and SQLite out of the box.
```

### Option 2: Question/Answer Format

```
FAQ

Q: What is Payload CMS?
A: Payload CMS is a headless CMS built with Node.js and TypeScript.

Q: How do I install Payload CMS?
A: You can install Payload CMS using npm, yarn, or pnpm.

Q: Can I use Payload CMS with Next.js?
A: Yes! Payload CMS works great with Next.js.
```

### Option 3: Numbered Questions

```
Frequently Asked Questions

1. What is Payload CMS?
Payload CMS is a headless CMS built with Node.js and TypeScript.

2. How do I install Payload CMS?
You can install Payload CMS using npm, yarn, or pnpm.

3. Can I use Payload CMS with Next.js?
Yes! Payload CMS works great with Next.js.
```

## Tips

- Use clear headings to mark the FAQ section
- Each question should be followed by its answer
- Questions can be in headings (H2, H3) or bold text
- Answers can be paragraphs or multiple paragraphs
- The parser will automatically detect and convert to FAQ blocks

## Example with Multiple Sections

```
# My Blog Post Title

This is the introduction content...

## FAQ

What is this about?
This is the answer to the first question.

How does it work?
This is the answer to the second question.

## More Content

Continue with your regular content...
```

The parser will:
1. Detect the "FAQ" heading
2. Extract all Q&A pairs until the next major section
3. Create a FAQ block automatically
4. Use AI to format and improve the questions/answers

