# Camellia garden assets

Current animation atlases: `{walk,pet,feed,scratch}-portrait-v1.webp`, from the user-selected `output/camellia-actions/portrait-match-draft` originals. Each has **12 frames**, four columns × three rows, with 384 × 320 pixel cells. Apple Vision removed the baked-in checkerboard backgrounds locally with user approval. Care frames use a calibrated 140-pixel torso width, fixed vertical scale and paw baseline; the bowl is excluded from the paw baseline. Walking uses a fixed .77 source scale instead of fitting its height to the atlas cell. Discrete playback avoids double silhouettes. Pet/Scratch last 3.5 seconds, Feed 5 seconds; walk uses one cycle per 64 CSS pixels. Reduced-motion care shows frame 5 (zero-based). Original drafts, processing sources and provenance are documented in that directory.

Previous animation atlases: `walk-gait-v2.webp`, `pet-dense-v1.webp`, `feed-dense-v1.webp`, `scratch-dense-v1.webp`. Each has **24 generated frames** in six columns and four rows, with 384 × 320 pixel cells. Shared per-action scale and ground alignment reduce frame jitter. Prompts and original sheets: `output/camellia-actions/dense/README.md`. Walking gait v2 uses new lifted/bent paw poses and distance-based playback (one cycle per 64 CSS pixels); source and prompts: `output/camellia-actions/gait/README.md`. The eight-frame assets below are retained as earlier versions.

Care reactions: `pet-generated-v1.png`, `feed-generated-v1.png`, and `scratch-generated-v1.png` each contain eight generated frames in a four-column, two-row atlas with 384 × 320 pixel cells. Pet and Scratch play over 3.5 seconds; Feed plays over 5 seconds. Accepted repeated interactions restart the reaction. Reduced-motion mode shows one representative frame. Prompts and provenance: `output/camellia-actions/care-prompts.md`.

Walking appearance: `walk-generated-v2.png`, eight generated walking frames, four columns of 384 × 320 pixels. Prompt and provenance: `output/camellia-actions/walk-v2-prompt.md`. The garden alternates short strolls with seated pauses. Care stops travel, and reduced-motion mode remains seated. Walking is an approximate generated frame animation, not video footage.

Current garden idle appearance: `idle-portrait-v1.webp`, the first pet frame on the same 384 × 320 canvas as every action. This avoids switching between different image padding, placement and proportions. The earlier `front-generated-v3.png` portrait is retained as a reference. Generation prompts and provenance: `output/camellia-actions/front-2694-prompt.md`. This is a static generated image; the profile card still uses the real photo. The footage documented below is retained as source material and is not currently played.

Archived footage source: user-supplied `public/e3da5fccb35a4ee5a8970b436a597f05.MOV`, first 3 seconds, 12 frames per second. Only the clear, front-facing seated portion before the hand enters is used.

The original cat pixels are preserved; backgrounds were removed locally with Apple Vision foreground instance masks. No generated animal or 3D model is used. Fine whiskers and soft fur edges may be imperfectly segmented. All frames share the same crop and scale; none are mirrored, reversed or warped.

`front-moments.webp`: 36 sequential frames, 6 columns, 384 × 384 pixels per cell.
`front-poster.webp`: frame 10, used while loading and for reduced motion.

The older `moments.webp` / `poster.webp` were extracted from `IMG_2124.MOV` (125.0–127.5 seconds) and are no longer loaded by the garden. Both original MOV files remain local and are excluded from the production build.

Care controls update the garden state and play the generated reactions above. The profile photo remains the user-supplied `IMG_2594.JPG`.
