# Why Are We Getting Rate Limits? 🤔

## Understanding Rate Limits

Rate limits are restrictions that Google Gemini API places on how many requests you can make in a given time period. When you exceed these limits, you get **429 Too Many Requests** errors.

## Why It's Happening

### 1. **Multiple API Calls Per Import** 📊

When you import a Google Doc with AI formatting enabled, the system makes **multiple API calls**:

#### For FAQ Sections:
- **1 call** for FAQ title (if exists)
- **1 call** per FAQ question
- **1 call** per FAQ answer

**Example:** A document with 5 FAQ items = **11 API calls**:
- 1 (title) + 5 (questions) + 5 (answers) = **11 calls**

#### For Main Content:
- **1 call** for the entire main content text

**Total for a typical import:** 12+ API calls per document!

### 2. **Google Gemini Free Tier Limits** 🆓

The free tier has **very strict limits**:

| Limit Type | Free Tier Limit |
|------------|----------------|
| **Requests per minute** | Very low (often 0 after initial usage) |
| **Tokens per minute** | Very low |
| **Daily quota** | Limited |
| **Monthly quota** | Limited |

**The Problem:**
- Each API call counts against **both** request count AND token count
- Free tier quotas are **shared across all users** of the free tier
- Once you hit the limit, you get `limit: 0` (quota exhausted)

### 3. **Token Usage** 💰

Each API call consumes tokens:
- **Input tokens**: Your content + prompt instructions
- **Output tokens**: AI's response

**Example:**
- FAQ question: ~50 tokens
- FAQ answer: ~200 tokens
- Main content: ~500-2000 tokens (depending on length)
- **Total per import**: Can easily be 2000+ tokens

### 4. **Rapid Successive Calls** ⚡

Even with 2-second delays between calls:
- 11 FAQ calls × 2 seconds = 22 seconds minimum
- But if you import multiple documents quickly, you can hit limits fast
- Free tier limits reset slowly (often hourly or daily)

## The Math 📐

### Scenario: Importing a Document with 5 FAQs

```
API Calls Breakdown:
├── FAQ Title: 1 call
├── FAQ Questions: 5 calls (one per question)
├── FAQ Answers: 5 calls (one per answer)
└── Main Content: 1 call
─────────────────────────
Total: 12 API calls per import
```

### Token Usage Example:

```
FAQ Title: ~30 tokens
5 Questions: ~250 tokens (50 each)
5 Answers: ~1000 tokens (200 each)
Main Content: ~1500 tokens
─────────────────────────
Total: ~2,780 tokens per import
```

**Free tier might only allow:**
- 1,000 tokens per minute
- 15 requests per minute

**Result:** You hit the limit after just **1-2 imports**! 🚫

## Why Free Tier is So Restrictive

1. **Cost Control**: Google needs to prevent abuse
2. **Resource Management**: AI processing is expensive
3. **Encourage Upgrades**: Free tier is meant for testing, not production
4. **Fair Usage**: Shared quota across all free tier users

## Solutions to Reduce Rate Limits

### ✅ **Solution 1: Batch Content Together** (Recommended)

Instead of making separate calls for each FAQ item, we could:
- Combine all FAQ questions into one call
- Combine all FAQ answers into one call
- Or combine everything into a single call

**Benefit:** Reduces 12 calls → 1-2 calls per import

### ✅ **Solution 2: Increase Delays**

Current: 2 seconds between calls
Better: 5-10 seconds between calls

**Benefit:** Spreads requests over time, reduces per-minute rate

### ✅ **Solution 3: Skip AI for FAQs**

Only use AI for main content, not FAQs:
- FAQs are usually already well-formatted
- Main content benefits more from AI enhancement

**Benefit:** Reduces 12 calls → 1 call per import

### ✅ **Solution 4: Upgrade to Paid Tier**

Paid tier has much higher limits:
- More requests per minute
- More tokens per minute
- Higher daily/monthly quotas

**Benefit:** Can handle multiple imports without hitting limits

### ✅ **Solution 5: Disable AI Formatting**

Import without AI formatting:
- Content still imports successfully
- No API calls = no rate limits
- You can manually edit content later

**Benefit:** Zero API calls, zero rate limit issues

## Current Implementation

### What We're Doing Now:

1. ✅ **2-second delays** between FAQ items
2. ✅ **Quota exhaustion detection** - stops immediately when limit hit
3. ✅ **Graceful degradation** - imports continue without AI
4. ✅ **Retry logic** - waits for quota reset time

### What We Could Improve:

1. 🔄 **Batch FAQ formatting** - combine multiple items into one call
2. 🔄 **Longer delays** - increase to 5-10 seconds
3. 🔄 **Smart skipping** - skip AI for short/simple content
4. 🔄 **Caching** - cache AI results for similar content

## Real-World Example

**Your Current Situation:**
```
Import 1: 12 API calls → ✅ Success
Import 2: 12 API calls → ⚠️ Rate limit (429)
Import 3: 12 API calls → ❌ Quota exhausted (limit: 0)
```

**Why:**
- Free tier allows ~15 requests per minute
- You made 24 requests in quick succession
- Quota exhausted after 2 imports

## Recommendations

### For Development:
- **Disable AI formatting** (`useAI: false`)
- Test imports without AI first
- Enable AI only for final polish

### For Production:
- **Upgrade to paid tier** for reliable AI formatting
- Or **batch content** to reduce API calls
- Or **use AI selectively** (only for main content)

### For Testing:
- Import **one document at a time**
- Wait **5-10 minutes** between imports
- Monitor your [Google AI Console](https://ai.dev/usage) for quota status

## Summary

**Why rate limits happen:**
1. 📊 Too many API calls per import (12+ calls)
2. 🆓 Free tier has very low limits
3. 💰 Each call consumes tokens
4. ⚡ Rapid successive imports exhaust quota quickly

**The fix:**
- Reduce API calls (batch content)
- Increase delays between calls
- Upgrade to paid tier
- Or disable AI formatting

The system is designed to **gracefully handle** rate limits - your imports will still succeed, just without AI enhancement when quota is exhausted.

