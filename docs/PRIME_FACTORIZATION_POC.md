# Prime Factorization Compression — Proof of Concept

## Goal

Encode Rhythm Wolf 16-step patterns as compact semantic integers using prime factorization, then reconstruct via FFT + Gaussian vectorization with **high accuracy, low resource footprint**.

---

## Mathematical Foundation

### Formula

```
V[v,s] = ⌊Gaussian(FFT(τ(P[v]))) / 2^b⌋ × 127

where:
  v ∈ [0..5]      (6 voices: kick, snare, perc, oh, ch, bass)
  s ∈ [0..15]     (16 steps)
  τ(P[v])         (token sequence mapped to primes)
  FFT(·)          (Fast Fourier Transform, O(n log n))
  Gaussian(·)     (smoothing + vectorization, O(1))
  2^b             (bit-depth denominator, normalize to [0,127])
```

### Compressed Representation

```
P_compressed = ∏ᵢ₌₀¹⁵ pᵢ^(1/16)  (16th root of voice's prime product)

MIDI[s] = round(Gaussian(FFT(P_compressed)) / 2^b) × 127
```

---

## Implementation Plan

### Phase 1: Prime Mapping (Baseline)
```typescript
// Token → Prime assignment (Gödel-style)
const TOKEN_PRIMES = {
  'KICK_ON': 2,
  'SNARE_ON': 3,
  'PERC_ON': 5,
  'OPHAT_ON': 7,
  'CLHAT_ON': 11,
  'BASS_ON': 13,
  'STEP_NEXT': 17,
  'PATTERN_END': 19,
}

function patternToPrimes(pattern: Pattern, voice: number): number[] {
  return pattern[voice].map(vel => vel > 0 ? TOKEN_PRIMES[voice] : 1)
}
```

### Phase 2: FFT Analysis
```typescript
// Apply FFT to prime sequence
function fftPrimes(primes: number[]): number[] {
  // Use native FFT or library (e.g., fft.js)
  // Input: [2, 1, 3, 1, 5, 1, 1, 1, ...]
  // Output: frequency bins [f₀, f₁, f₂, f₃, f₄, f₅, f₆, f₇, f₈]
  
  // For 16-step: 16 → FFT → 9 bins (n/2 + 1)
  const fft = new FFT(16)
  const spectrum = fft.forward(primes)
  return spectrum.slice(0, 9) // Take magnitude
}
```

### Phase 3: Gaussian Vectorization
```typescript
// Map frequency bins → fixed 7-dim vector via Gaussian smoothing
function gaussianVectorize(spectrum: number[]): number[] {
  // Smooth spectrum with Gaussian kernel
  const smoothed = gaussian(spectrum, sigma=1.0)
  
  // Extract features: 3 freq pairs + variance
  return [
    smoothed[0],      // μ₁ (low freq)
    smoothed[1],      // μ₂ (mid freq)
    smoothed[2],      // μ₃ (high freq)
    variance(smoothed),
  ].slice(0, 7)
}
```

### Phase 4: MIDI Conversion
```typescript
// Fixed vector → MIDI velocity (0-127)
function vectorToMidi(vec: number[], bitDepth: number = 8): number[] {
  const denom = Math.pow(2, bitDepth)
  
  return Array(16).fill(0).map((_, step) => {
    // Map each step's frequency component to MIDI range
    const normalized = vec[step % vec.length] / denom
    return Math.round(Math.max(0, Math.min(normalized * 127, 127)))
  })
}
```

---

## Accuracy Metrics

### Round-Trip Fidelity
```
Original pattern:  BD ●···●···●···●···
                   SD ···●···●···●···●

After encode/decode: should preserve kick/snare hit positions
Metric: Hamming distance on hits ≤ 1 step (tolerance for quantization)
```

### Similarity Preservation
```
Patterns A & B with similar kick patterns
  sim_embeddings(A, B) ≈ shared_primes(A, B) / total_primes

Should correlate > 0.85 with human "musical similarity" ratings
```

### Resource Footprint
```
Encode: FFT(16) = ~64 operations, Gaussian = O(1)
Decode: Inverse FFT = ~64 operations, vector → MIDI = O(16)
Total: < 200 ops per voice, 6 voices = 1200 ops/pattern

Baseline (current tokenizer): 96 tokens × 10 bytes = 960 bytes
Prime compressed: 1 large integer (~50 bytes) + 7 floats (56 bytes) = ~106 bytes
Compression ratio: ~8.9× smaller
```

---

## PoC Testing Checklist

- [ ] Implement `patternToPrimes()`
- [ ] Implement FFT wrapper (use `fft.js` or `dsp.js`)
- [ ] Implement `gaussianVectorize()`
- [ ] Implement `vectorToMidi()`
- [ ] Test round-trip: pattern → primes → FFT → gaussian → MIDI → pattern
- [ ] Measure accuracy (Hamming distance on hits)
- [ ] Measure performance (ops/ms)
- [ ] Compare vs. current embeddings (similarity correlation)
- [ ] Benchmark memory usage

---

## Expected Outcomes

✅ **High Accuracy**: Reconstruct patterns with ≥95% hit position accuracy  
✅ **Low Footprint**: 8-10× compression vs. token arrays  
✅ **Fast**: < 1ms encode/decode per pattern  
✅ **Semantic**: Shared primes indicate musical relationships  
✅ **ML-Ready**: 7-dim vectors work directly with neural nets  

---

## Success Criteria

| Metric | Target | Current |
|--------|--------|---------|
| Hit accuracy | ≥95% | TBD |
| Encode time | <1ms | TBD |
| Decode time | <1ms | TBD |
| Compression | 8-10× | TBD |
| Similarity correlation | >0.85 | TBD |

---

## Next Steps

1. Create `src/lib/primeFactorization.ts` with Phase 1-4 implementation
2. Add tests: `src/__tests__/lib/primeFactorization.test.ts`
3. Benchmark vs. current tokenizer
4. If ≥95% accuracy: promote to Phase 2.0 roadmap
5. If <95%: investigate FFT window function or feature extraction tuning

---

## References

- **Gödel Numbering**: Semantic encoding via prime factorization
- **FFT**: Fast Fourier Transform for O(n log n) frequency analysis
- **Gaussian Smoothing**: Noise reduction + feature extraction
- **MIDI Velocity**: 0-127 range standard for all drum synthesizers

---

**Status**: Ready for PoC implementation  
**Target Version**: v1.1  
**Effort Estimate**: 2-3 days (implementation + benchmarking)
