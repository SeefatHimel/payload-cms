# Sample Google Doc for FAQ Testing

Copy this structure into a Google Doc and import it to test the FAQ auto-detection:

---

# My Blog Post Title

This is the introduction paragraph of my blog post. Here I explain what the post is about.

## Main Content Section

This is the main content of the blog post. You can write anything here.

### Subsection

More content here...

## FAQ

What is Payload CMS?
Payload CMS is a headless CMS built with Node.js and TypeScript. It provides a powerful admin panel and flexible content management system.

How do I install Payload CMS?
You can install Payload CMS using npm, yarn, or pnpm. Simply run: npm install payload

Can I use Payload CMS with Next.js?
Yes! Payload CMS works great with Next.js. There are official templates and examples available on the Payload website.

What databases does Payload CMS support?
Payload CMS supports PostgreSQL, MongoDB, and SQLite out of the box. You can choose the database that best fits your needs.

## Conclusion

This is the conclusion of the blog post.

---

## Alternative FAQ Format

You can also use these formats:

### Frequently Asked Questions

Q: What is the pricing?
A: Our pricing starts at $9.99 per month for the basic plan.

Q: Do you offer a free trial?
A: Yes, we offer a 14-day free trial with full access to all features.

### Questions and Answers

1. How do I cancel my subscription?
You can cancel your subscription at any time from your account settings.

2. Can I upgrade my plan?
Yes, you can upgrade or downgrade your plan at any time.

---

## Notes for Testing

- The parser will detect sections with headings containing: "FAQ", "Frequently Asked Questions", "Q&A", "Questions and Answers", etc.
- Questions can be:
  - Headings (H2, H3, H4) ending with "?"
  - Paragraphs ending with "?"
  - Paragraphs starting with "Q:" or "Question:"
  - Short paragraphs starting with question words (what, how, why, etc.)
- Answers are paragraphs that follow questions
- The FAQ section ends when it hits another major heading or non-Q&A content

