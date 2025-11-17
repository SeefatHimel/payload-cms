# FAQ Auto-Detection Guide

## ✅ How It Works

When you import a Google Doc, the system automatically:

1. **Detects FAQ Sections** - Looks for headings containing:
   - "FAQ"
   - "Frequently Asked Questions"
   - "Questions and Answers"
   - "Q&A"
   - "Q and A"
   - "FAQs"
   - "Common Questions"

2. **Identifies Questions** - Recognizes:
   - Headings (H2, H3, H4) ending with "?"
   - Headings starting with question words (what, how, why, when, where, who, which, can, will, should, does, is, are)
   - Paragraphs ending with "?"
   - Paragraphs starting with "Q:" or "Question:"
   - Numbered questions (1. Question?)
   - Short paragraphs starting with question words

3. **Extracts Answers** - Collects paragraphs that follow questions

4. **AI Formatting** (if enabled):
   - Formats questions to be clear and concise
   - Improves answer clarity and grammar
   - Preserves structure and meaning

5. **Creates FAQ Blocks** - Automatically converts to Payload CMS FAQ blocks

## 📝 Sample Google Doc Format

### Format 1: Heading-based (Recommended)

```
# My Blog Post

Introduction content here...

## FAQ

What is Payload CMS?
Payload CMS is a headless CMS built with Node.js and TypeScript.

How do I install it?
You can install Payload CMS using npm, yarn, or pnpm.

Can I use it with Next.js?
Yes! Payload CMS works great with Next.js.
```

### Format 2: Q&A Format

```
## Frequently Asked Questions

Q: What is the pricing?
A: Our pricing starts at $9.99 per month.

Q: Do you offer a free trial?
A: Yes, we offer a 14-day free trial.
```

### Format 3: Numbered Questions

```
## Questions and Answers

1. How do I cancel?
You can cancel from your account settings.

2. Can I upgrade?
Yes, you can upgrade at any time.
```

## 🎯 Tips for Best Results

1. **Use Clear Headings** - Mark your FAQ section with a heading containing "FAQ" or similar
2. **End Questions with "?"** - Makes detection more reliable
3. **Keep Questions Short** - Questions should be concise (under 150 characters)
4. **One Answer Per Question** - Each question should be followed by its answer
5. **End FAQ Section** - The FAQ section ends when it hits another major heading (H1, H2) or non-Q&A content

## 🤖 AI Formatting

When AI formatting is enabled:
- Questions are improved for clarity while keeping them as questions
- Answers are enhanced for readability and grammar
- Structure and meaning are preserved
- FAQ titles are also formatted

## ✅ Testing

1. Create a Google Doc with FAQ content using one of the formats above
2. Import it via `/admin/google-docs` or the import API
3. Enable AI formatting if you want content enhancement
4. Check the logs for FAQ detection messages
5. The FAQ will appear as a collapsible accordion block in your post

## 🔍 Debugging

Check the import logs for:
- `🔍 Detecting FAQ sections...`
- `✅ Found X FAQ section(s) with Y total questions`
- `✅ Inserted X FAQ block(s) into content`

If no FAQs are detected:
- Make sure you have a heading with "FAQ" or similar keywords
- Ensure questions end with "?" or start with question words
- Check that answers follow questions immediately

