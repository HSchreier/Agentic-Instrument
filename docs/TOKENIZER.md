# Beat Tokenization System

## Overview

The tokenizer converts MIDI drum patterns into structured token sequences that enable:
- **Claude AI understanding** of drum patterns through natural language
- **Pattern similarity matching** using embeddings
- **ML model training** with token-based representations
- **Pattern visualization** and analysis

## Token Types

Each drum voice has two tokens:

| Voice | Tokens |
|-------|--------|
| Kick | `KICK_ON`, `KICK_OFF` |
| Snare | `SNARE_ON`, `SNARE_OFF` |
| Percussion | `PERC_ON`, `PERC_OFF` |
| Open Hat | `OPHAT_ON`, `OPHAT_OFF` |
| Closed Hat | `CLHAT_ON`, `CLHAT_OFF` |
| Bass | `BASS_ON`, `BASS_OFF` |

Flow tokens:
- `STEP_NEXT` — Move to next sequencer step
- `PATTERN_END` — End of 16-step pattern

## Usage

### Convert Pattern to Tokens

```typescript
import { patternToTokens } from '@/lib/tokenizer'
import { generate } from '@/lib/pattern'

const pattern = generate('Techno', 'Four on the Floor', false, 12345)
const tokens = patternToTokens(pattern)
// → ['KICK_ON', 'STEP_NEXT', 'SNARE_ON', ...]
```

### Convert Tokens Back to Pattern

```typescript
import { tokensToPattern } from '@/lib/tokenizer'

const pattern = tokensToPattern(tokens)
// → Pattern array reconstructed from tokens
```

### Generate Descriptions

```typescript
import { patternToDescription, patternToASCII } from '@/lib/tokenizer'

const description = patternToDescription(pattern)
// → "Kick: 4 hits | Snare: 4 hits | Closed Hat: 8 hits"

const ascii = patternToASCII(pattern)
// → Monospace grid visualization:
//   BD ●···●···●···●···
//   SD ···●···●···●···●
//   ...
```

## Pattern Embeddings & Similarity

### Get Pattern Embedding

```typescript
import { getPatternEmbedding } from '@/lib/tokenizer'

const embedding = getPatternEmbedding(pattern)
// → [0.25, 0.25, 0.125, 0.5, 0.5, 0, 0.18] // densities + variance
```

The embedding contains:
- **6 density values** (0-1) — hits per voice / 16 steps
- **1 variance value** — complexity measure (std dev of densities)

### Compare Patterns

```typescript
import { getPatternSimilarity } from '@/lib/tokenizer'

const similarity = getPatternSimilarity(pattern1, pattern2)
// → 0.85 (cosine similarity: 0 = different, 1 = identical)

// Use cases:
if (similarity > 0.7) {
  // Patterns are similar
}

if (similarity < 0.3) {
  // Patterns are very different
}
```

## Claude Integration

The Chat View uses tokenization to help Claude understand patterns:

```
Input:  "deep house groove"

Output: "I've created a Deep House pattern at 120 BPM. 
        **Pattern tokens:** KICK_ON STEP_NEXT SNARE_ON STEP_NEXT CLHAT_ON ...
        
        **Composition:** Kick: 4 hits | Snare: 4 hits | Closed Hat: 8 hits
        
        BD ●···●···●···●···
        SD ···●···●···●···●
        CH ··●·●·●·●·●·●·●
        ..."
```

By including:
1. **Token sequence** — Claude sees pattern structure
2. **Text description** — Human-readable summary
3. **ASCII visualization** — Visual pattern layout

Claude gains better understanding for:
- Analyzing requested patterns
- Suggesting variations
- Creating similar patterns
- Learning from user feedback

## Performance

- **Token conversion**: O(n) where n = 96 (6 voices × 16 steps)
- **Embedding**: O(6) = constant time
- **Similarity**: O(1) cosine similarity of 7-dim vectors

## Future Extensions

1. **Pattern clustering** — Group similar beats using embeddings
2. **Recommendation** — Suggest variations based on similarity
3. **ML fine-tuning** — Train models on tokenized patterns
4. **Compression** — Store tokens instead of full patterns
5. **Pattern morphing** — Interpolate between pattern embeddings

## Testing

Run tests:
```bash
npm run test -- tokenizer.test.ts
```

Verify tokenizer round-trip:
```typescript
const tokens = patternToTokens(pattern)
const reconstructed = tokensToPattern(tokens)
// Both should have same drum hits per voice
```
