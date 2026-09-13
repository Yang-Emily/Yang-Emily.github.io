# Camellia action-generation trial

Generated with the built-in imagegen tool, using `public/camellia/front-poster.webp` as the identity reference.

`walk-draft-v1.png` is a REVIEW DRAFT, not a production animation. It has visible identity drift, an incomplete gait cycle, and a baked-in checkerboard rather than transparency. It is deliberately not loaded by the garden. The front-facing real footage remains active.

Requested actions still requiring usable animation: walk, run, sit, side-roll, rest, pet response, feeding, scratch response. These need temporally coherent video generation or additional real recordings; the current image-only tool has not produced suitable motion.

## Exact prompt

Use case: photorealistic-natural, identity-preserve. Asset type: transparent photographic sprite sheet for an interactive pet garden. Reference image is the identity reference of the user's actual cat Camellia, a young blue golden shaded shorthair female. Preserve her exact face, pale cream golden cheeks and underside, blue-grey shaded back, dark round green-grey eyes, pink nose, short dense realistic fur and fine white whiskers. Generate ONE high-resolution 4-column by 2-row sprite sheet, precisely 8 equal cells, with 8 successive chronological poses of ONE complete natural slow quadruped walking gait cycle. Every cell contains the same full-body real-looking cat, facing right in consistent near-side three-quarter view, same camera, scale, lighting and ground baseline. Walk in place; the paws articulate anatomically, shoulder and pelvis shift subtly, weight transfers with planted feet, tail curves softly; consecutive frames are small movements, no jumps in appearance. Head and ears remain stable in relative size. Full tail and all paws in every cell with generous transparent margins, no crop. The sheet should be genuinely transparent alpha with NO background, NO labels, NO grid lines, NO text, NO floor shadow, NO human, NO collar, NO props. Natural photographic appearance, NOT illustration, not 3D plastic, not cartoon. At least 2048 pixels wide. Exact regular 4x2 alignment for extracting cells.
