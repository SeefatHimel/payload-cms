# Content Team Guide: Writing Google Docs for Payload CMS

## 📋 Overview

This guide helps content writers create Google Docs that import cleanly into Payload CMS with proper formatting, blocks, and FAQ sections.

---

## 🎯 Quick Start

1. **Create your Google Doc** with clear structure
2. **Use proper headings** (H1, H2, H3, H4)
3. **Format FAQ sections** using the patterns below
4. **Import via** `/admin/google-docs` or share the Google Doc URL
5. **Review and publish** in Payload CMS admin

---

## 📝 Document Structure

### Basic Structure

```
# Main Title (H1)
Your introduction paragraph here...

## Section Heading (H2)
Content for this section...

### Subsection (H3)
More detailed content...

## FAQ
[FAQ content - see FAQ section below]

## Conclusion
Final thoughts...
```

### Best Practices

✅ **DO:**
- Use H1 for the main title (becomes post title)
- Use H2 for major sections
- Use H3 for subsections
- Keep paragraphs focused and concise
- Use bullet lists for multiple points
- Add images inline where needed

❌ **DON'T:**
- Use H1 multiple times (only for title)
- Mix heading levels randomly
- Use excessive formatting (colors, fonts)
- Include complex tables (keep them simple)
- Use headers/footers (they won't import)

---

## ❓ FAQ Sections

### How FAQ Detection Works

The system automatically detects FAQ sections when it finds:
- A heading containing: "FAQ", "Frequently Asked Questions", "Q&A", "Questions and Answers", etc.
- Questions (headings or paragraphs ending with "?")
- Answers (paragraphs following questions)

### Format 1: Heading-Based (Recommended) ⭐

**Best for:** Most use cases

```
## FAQ

What is Payload CMS?
Payload CMS is a headless content management system built with TypeScript and Node.js. It provides a self-hosted, API-first solution for managing content.

How do I install Payload CMS?
You can install Payload CMS using npm or yarn. The easiest way is to use the official CLI: `npx create-payload-app@latest my-app`

Can I use custom blocks?
Yes! Payload CMS supports custom blocks through its rich text editor. You can create FAQ blocks, banner blocks, code blocks, and more.

What databases does Payload CMS support?
Payload CMS supports multiple databases including MongoDB, PostgreSQL, and SQLite.
```

**Tips:**
- Use H2 for the FAQ section heading
- Use H3 or H4 for questions (or regular paragraphs)
- End questions with "?"
- Keep questions concise (under 150 characters)
- Answers can be multiple paragraphs

### Format 2: Q&A Format

**Best for:** Traditional Q&A style

```
## Frequently Asked Questions

Q: What is the pricing?
A: Our pricing starts at $9.99 per month with a 14-day free trial.

Q: Do you offer refunds?
A: Yes, we offer a 30-day money-back guarantee.

Q: Can I cancel anytime?
A: Absolutely! You can cancel your subscription at any time from your account settings.
```

**Tips:**
- Start questions with "Q:" or "Question:"
- Start answers with "A:" or "Answer:" (optional)
- Keep it consistent throughout

### Format 3: Numbered Questions

**Best for:** Sequential FAQs

```
## Questions and Answers

1. How do I get started?
Create an account, choose a plan, and start building your content.

2. What payment methods do you accept?
We accept all major credit cards, PayPal, and bank transfers.

3. Is there a mobile app?
Yes, we have iOS and Android apps available in their respective app stores.
```

**Tips:**
- Use numbered lists (1., 2., 3.)
- End questions with "?"
- Keep numbering sequential

### Format 4: Bold Questions

**Best for:** Visual emphasis

```
## Common Questions

**What is your return policy?**
We offer a 30-day return policy on all products. Items must be in original condition.

**Do you ship internationally?**
Yes, we ship to over 50 countries worldwide. Shipping costs vary by location.

**How long does shipping take?**
Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days.
```

**Tips:**
- Make questions **bold**
- Follow immediately with answer paragraph
- Keep questions short

---

## 📐 Formatting Guidelines

### Headings

| Level | Use Case | Example |
|-------|----------|---------|
| H1 | Main title only | `# Getting Started with Payload CMS` |
| H2 | Major sections | `## Installation Guide` |
| H3 | Subsections | `### Prerequisites` |
| H4 | Minor subsections | `#### Windows Installation` |

**Rules:**
- Only ONE H1 per document (becomes post title)
- Use H2 for main sections
- Use H3/H4 for nested content
- Don't skip levels (H1 → H3 is bad, H1 → H2 → H3 is good)

### Text Formatting

✅ **Supported:**
- **Bold** text
- *Italic* text
- ~~Strikethrough~~ (imports but may not display)
- `Code` inline
- Links (URLs)

❌ **Not Recommended:**
- Custom colors
- Custom fonts
- Underline (use bold/italic instead)
- Text highlights

### Lists

**Bullet Lists:**
```
- First item
- Second item
- Third item
  - Nested item
  - Another nested item
```

**Numbered Lists:**
```
1. First step
2. Second step
3. Third step
```

**Tips:**
- Use lists for multiple related points
- Keep items concise
- Use nested lists for sub-points

### Code Blocks

For code snippets, use:

```
## Code Example

Here's how to install:

```
npm install payload
```

Or use inline code: `npm install payload`
```

**Note:** Code blocks will be converted to code blocks in the CMS.

### Images

1. **Insert images directly** into Google Docs
2. Images will be **automatically extracted** during import
3. Images are **uploaded to the media library**
4. Images appear **where you placed them** in the document

**Tips:**
- Use clear, descriptive image names
- Keep images reasonably sized (under 5MB recommended)
- Add alt text in Google Docs (if possible)
- Place images near relevant content

### Links

**Supported formats:**
- `https://example.com` (auto-detected)
- `[Link text](https://example.com)` (Markdown-style)
- Hyperlinks in Google Docs

**Tips:**
- Use descriptive link text
- Test links before importing
- Internal links to pages/posts will be converted automatically

---

## 🎨 Content Blocks

### Banner Blocks

To create a banner/alert, use this format:

```
## Important Notice

⚠️ This is an important notice that will appear as a banner.

[Use bold text or emoji to make it stand out]
```

**Note:** Banner blocks are created automatically for certain patterns or can be added manually in the CMS.

### Code Blocks

```
## Example Code

```typescript
function example() {
  return "Hello, World!"
}
```
```

### Media Blocks

Images you insert will automatically become media blocks. For better control:
- Insert images inline where you want them
- Add captions below images in Google Docs
- Captions will be preserved

---

## ✅ Checklist Before Import

Before importing your Google Doc, check:

- [ ] Document has a clear H1 title
- [ ] Headings are properly structured (H1 → H2 → H3)
- [ ] FAQ sections use one of the recommended formats
- [ ] Questions end with "?" or start with question words
- [ ] Images are inserted (not just linked)
- [ ] Links are working and properly formatted
- [ ] No excessive formatting (colors, fonts)
- [ ] Content is proofread and ready
- [ ] Document is shared with the import account (if needed)

---

## 🚀 Import Process

### Step 1: Prepare Your Document

1. Write your content following this guide
2. Format FAQ sections properly
3. Insert images where needed
4. Review and proofread

### Step 2: Import

1. Go to `/admin/google-docs` in Payload CMS
2. Paste your Google Doc URL or ID
3. Choose whether to use AI formatting (optional)
4. Click "Import"

### Step 3: Review

1. Check the imported post in the admin panel
2. Verify FAQ blocks are correctly formatted
3. Review images and links
4. Make any final edits
5. Publish!

---

## 💡 Pro Tips

### For Better FAQ Detection

1. **Use clear section headings:**
   - ✅ "FAQ"
   - ✅ "Frequently Asked Questions"
   - ✅ "Common Questions"
   - ❌ "Questions" (too vague)
   - ❌ "Help" (won't be detected)

2. **Make questions obvious:**
   - ✅ End with "?"
   - ✅ Start with question words (What, How, Why, etc.)
   - ✅ Keep them short and clear

3. **Keep answers together:**
   - Put answer immediately after question
   - Don't insert other content between Q&A pairs
   - Use multiple paragraphs for longer answers

### For Better Content Structure

1. **Start with an introduction** - Give context before diving into details
2. **Use clear section breaks** - H2 headings for major topics
3. **Keep paragraphs focused** - One main idea per paragraph
4. **Use lists for multiple points** - Easier to scan and read
5. **End with a conclusion** - Summarize key points

### For Images

1. **Use descriptive filenames** - "hero-image.jpg" not "IMG_1234.jpg"
2. **Add context** - Place images near relevant text
3. **Optimize size** - Large images slow down imports
4. **Use captions** - Add text below images for context

---

## 🐛 Troubleshooting

### FAQ Not Detected?

**Problem:** FAQ section not converted to FAQ block

**Solutions:**
- Check that section heading contains "FAQ" or similar keywords
- Ensure questions end with "?" or start with question words
- Verify questions are followed by answer paragraphs
- Try using H2 for FAQ section heading

### Images Not Importing?

**Problem:** Images missing after import

**Solutions:**
- Make sure images are inserted (not just linked)
- Check image file size (very large images may fail)
- Verify Google Doc sharing permissions
- Try re-importing with different settings

### Formatting Lost?

**Problem:** Formatting doesn't match Google Doc

**Solutions:**
- Some formatting (colors, custom fonts) won't import
- Use standard formatting (bold, italic, headings)
- Complex tables may need manual adjustment
- Review in CMS and make final edits

### Content Structure Issues?

**Problem:** Content doesn't look right after import

**Solutions:**
- Check heading hierarchy (H1 → H2 → H3)
- Ensure proper paragraph breaks
- Review in CMS editor and adjust
- Use the CMS editor for final formatting tweaks

---

## 📚 Examples

### Example 1: Blog Post with FAQ

```
# Getting Started with TypeScript

TypeScript is a powerful programming language that adds static typing to JavaScript. This guide will help you get started.

## What is TypeScript?

TypeScript is a superset of JavaScript that compiles to plain JavaScript. It adds optional static typing and other features.

## Installation

### Prerequisites

- Node.js installed
- npm or yarn package manager

### Steps

1. Install TypeScript globally: `npm install -g typescript`
2. Create a new project: `mkdir my-project && cd my-project`
3. Initialize TypeScript: `tsc --init`

## FAQ

What are the benefits of TypeScript?
TypeScript provides static typing, better IDE support, and catches errors at compile time.

Is TypeScript harder to learn?
TypeScript has a learning curve, but if you know JavaScript, you can learn TypeScript gradually.

Can I use TypeScript with React?
Yes! TypeScript works great with React. Many projects use TypeScript for React development.

## Conclusion

TypeScript is a valuable tool for JavaScript development. Start with the basics and gradually adopt more advanced features.
```

### Example 2: Product Guide with FAQ

```
# Product User Guide

Welcome to our product! This guide will help you get the most out of it.

## Getting Started

[Content here...]

## Features

[Content here...]

## Frequently Asked Questions

How do I create an account?
Click the "Sign Up" button in the top right corner and follow the prompts.

What payment methods do you accept?
We accept all major credit cards, PayPal, and bank transfers.

Can I cancel my subscription?
Yes, you can cancel anytime from your account settings. No questions asked.

Is there a mobile app?
Yes! We have iOS and Android apps available in the App Store and Google Play.

## Support

[Content here...]
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check this guide** - Most common issues are covered here
2. **Review the FAQ detection guide** - `FAQ_AUTO_DETECTION_GUIDE.md`
3. **Contact the development team** - For technical issues
4. **Test with a simple document first** - Before importing large documents

---

## 🎓 Training Resources

- **Google Docs Formatting:** [Google Docs Help](https://support.google.com/docs)
- **Markdown Basics:** Useful for understanding formatting
- **Payload CMS Admin:** Practice editing imported content

---

**Last Updated:** 2025-01-18
**Version:** 1.0

