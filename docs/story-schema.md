# Story Schema

Canonical specification for stories in Humanity Archived. This document is the source of truth. The TypeScript schema in `src/lib/schema.ts` and the loader in `src/lib/stories.ts` must conform to this spec.

## Philosophy

A story is a self-contained narrative unit. The schema describes the story itself: what it is, when and where it originates, who created or recorded it, in what language, and how it relates to other stories.

Curatorial judgment (sensitivity, factual dispute, controversy, restricted-knowledge concerns) is handled in the human review process when a submission or import PR is reviewed. It is not encoded as schema fields.

The schema covers seven genres: mythology, folklore, oral history, religious narrative, historical account, personal/family history, and epic. It is designed to also handle stories-as-music (songs, ballads, songlines) via the `form` field.

## File layout

Each story is a directory under `content/stories/`:

```
content/stories/<slug>/
  index.yaml              # all metadata
  en.md                   # modern English body (default render)
  <iso-code>.md           # original-language body, when applicable
  en-<year>.md            # historical translation, optional
```

The directory name is the slug. The `index.yaml` file holds all metadata. Each `.md` file is a pure language body, no frontmatter.

## Languages

Language codes are ISO 639-1 (`en`, `sa`, `ta`, `ja`, `ar`). For dead or low-resource languages without ISO 639-1, use ISO 639-3 (`grc` Ancient Greek, `akk` Akkadian, `ak` Akan).

The default rendered body is `en.md`. The reader UI can switch to any other language file present.

For pure oral traditions where no original written text exists, use the special value `oral` in the `language` field, set `isOralTradition: true`, and omit the original-language body file.

## index.yaml schema

```yaml
# Identity
slug: string                      # required, /^[a-z0-9-]+$/
title: string                     # required, display title
form: prose | verse | song        # required, default 'prose'

# Genre
genre: mythology | folklore | oral-history | religious | historical | personal | epic

# Origin time
timePeriod: string                # required, human label e.g. "6th century BCE"
approxYear: integer | null        # optional, single year for sorting (negative = BCE)

# Origin language and orality
language: string                  # required, original language ISO code, or 'oral'
isOralTradition: boolean          # default false

# Place (point on map)
region:
  name: string                    # required, human placename
  countryCode: string | null      # ISO 3166-1 alpha-2
  lat: number | null              # -90..90
  lng: number | null              # -180..180

# Grouping (all optional)
cycle: string | null              # narrative tradition slug, e.g. "mahabharata"
episode: string | null            # named unit within cycle
variantLabel: string | null       # human label for non-canonical retellings; null = canonical
taleType: string | null           # ATU index code, e.g. "ATU 510A"
tags: string[]                    # ad-hoc clusters: events, families, themes

# Attribution
author: string | null             # original creator or tradition name
authorVisible: boolean            # default true; false hides author in UI
collector: string | null          # who recorded an oral source
translator: string | null         # who produced en.md
sourceTranslator: string | null   # who produced en-<year>.md if present

# Provenance
provenance:
  kind: canon | submission        # required
  source: string                  # 'wikisource' | 'gutenberg' | 'sacred-texts' | 'submission' | ...
  sourceUrl: string | null
  importedAt: string              # ISO 8601 timestamp

# Media (S3/CloudFront URLs)
media:
  - kind: image | audio | video
    url: string
    caption: string | null

# License
license: string                   # default 'CC-BY-SA-4.0'

# Submission privacy (only on submissions)
submittedByHash: string | null

# Bookkeeping
createdAt: string                 # ISO 8601, when added to archive
```

## Grouping semantics

The grouping fields form orthogonal axes. A story can have any combination, including all null.

### `cycle`

A narrative tradition that contains multiple named episodes. Cycles are internal to one tradition.

Examples: `mahabharata`, `iliad`, `odyssey`, `arthurian`, `anansi`, `nasreddin`, `aesop`, `theseus`, `heracles`, `gilgamesh`, `popol-vuh`, `kojiki`.

### `episode`

A named unit within a cycle. Episodes are how humans remember and retell long-form material. Cantos and book divisions are editorial; episodes are narrative.

Example: within `cycle: mahabharata`, episodes include `bhagavad-gita`, `karna-death`, `dice-game`, `kurukshetra-war`.

### `variantLabel`

Identifies a non-canonical retelling of an episode. `null` means this is the canonical version. Multiple variants of the same episode are peer files sharing `cycle` and `episode`, distinguished by `variantLabel`.

Example: `"Tamil retelling, Villiputhur 14th c."`, `"Indonesian Kakawin"`, `"Bengali Kashiram Das"`.

### `taleType`

Cross-cultural tale-type identifier using the Aarne-Thompson-Uther index. Connects variants of the same story across traditions that have no common parent cycle.

Example: ATU 510A is Cinderella. Yeh-Shen (China), Rhodopis (Egypt), Cendrillon (France), and Aschenputtel (Germany) all share `taleType: "ATU 510A"` while having `cycle: null`.

### `tags`

Free-form. Use for clusters that do not fit cycle, episode, or ATU.

Conventions:
- Event clusters: `partition-1947`, `dust-bowl`, `tiananmen-1989`
- Family lineages: `family:bhargava`, `family:okonkwo`
- Thematic patterns outside ATU: `creation-myth`, `flood-myth`, `trickster`, `descent-to-underworld`

## Translation provenance

The `translator` field treats human and model translators identically. Both are credited as peers.

Examples:
- `translator: "Robert Fagles (1990)"`
- `translator: "Claude Opus 4.7 (2026-04-26)"`
- `translator: "R.S. Rattray (1930)"`

The field always names the translator and the year. There is no separate flag distinguishing automated from human translation. If a historical translation exists as a sibling file (e.g. `en-1900.md`), its translator goes in `sourceTranslator`.

## License inheritance

Canon stories inherit their source's license. Wikisource is CC-BY-SA-4.0. Project Gutenberg and sacred-texts originals are typically Public Domain.

The retranslated `en.md` body is a derivative work and inherits the source license. The translator is credited; the translator claims no rights.

Submissions default to CC-BY-SA-4.0 unless the submitter specifies otherwise.

## Slug rules

Pattern: `^[a-z0-9-]+$`.

Conventions:
- Cycle members: prefix with cycle slug. `mahabharata-karna-death-tamil`, `iliad-helen-abduction`
- Tale-type variants: use the variant's own name. `yeh-shen`, `cendrillon`, `aschenputtel`
- Standalones: descriptive. `pandoras-box`, `wolf-and-crane`

## Examples

### Standalone fable (canon)

`content/stories/aesop-wolf-and-crane/index.yaml`:

```yaml
slug: aesop-wolf-and-crane
title: "The Wolf and the Crane"
form: prose
genre: folklore
timePeriod: "6th century BCE"
approxYear: -550
language: grc
isOralTradition: false
region:
  name: "Greece"
  countryCode: GR
  lat: 39.0
  lng: 22.0
cycle: aesop
episode: null
variantLabel: null
taleType: null
tags: []
author: "Aesop"
authorVisible: true
collector: null
translator: "Claude Opus 4.7 (2026-04-26)"
sourceTranslator: null
provenance:
  kind: canon
  source: wikisource
  sourceUrl: "https://en.wikisource.org/wiki/Aesop%27s_Fables/The_Wolf_and_the_Crane"
  importedAt: "2026-04-26T00:00:00Z"
media: []
license: "CC-BY-SA-4.0"
createdAt: "2026-04-26T00:00:00Z"
```

Files: `en.md`, `grc.md`.

### Regional variant within an epic

`content/stories/mahabharata-karna-death-tamil/index.yaml`:

```yaml
slug: mahabharata-karna-death-tamil
title: "The Death of Karna (Villiputhur Tamil retelling)"
form: verse
genre: epic
timePeriod: "14th century"
approxYear: 1400
language: ta
isOralTradition: false
region:
  name: "Villiputhur, Tamil Nadu"
  countryCode: IN
  lat: 9.4
  lng: 78.1
cycle: mahabharata
episode: karna-death
variantLabel: "Tamil retelling, Villiputhur 14th c."
taleType: null
tags: []
author: "Villiputturar"
authorVisible: true
collector: null
translator: "Claude Opus 4.7 (2026-04-26)"
sourceTranslator: null
provenance:
  kind: canon
  source: wikisource
  sourceUrl: "..."
  importedAt: "2026-04-26T00:00:00Z"
media: []
license: "CC-BY-SA-4.0"
createdAt: "2026-04-26T00:00:00Z"
```

Files: `en.md`, `ta.md`.

### Oral tradition (Anansi tale)

`content/stories/anansi-how-stories-came/index.yaml`:

```yaml
slug: anansi-how-stories-came
title: "How Anansi Got the Sky-God's Stories"
form: prose
genre: folklore
timePeriod: "Pre-1900, recorded 1930"
approxYear: null
language: oral
isOralTradition: true
region:
  name: "Kumasi, Ghana"
  countryCode: GH
  lat: 6.6
  lng: -1.6
cycle: anansi
episode: how-stories-came
variantLabel: null
taleType: null
tags: ["trickster"]
author: "Akan oral tradition"
authorVisible: true
collector: "R.S. Rattray (1930)"
translator: "Claude Opus 4.7 (2026-04-26)"
sourceTranslator: "R.S. Rattray (1930)"
provenance:
  kind: canon
  source: gutenberg
  sourceUrl: "..."
  importedAt: "2026-04-26T00:00:00Z"
media: []
license: "Public Domain"
createdAt: "2026-04-26T00:00:00Z"
```

Files: `en.md` (modern), `en-1930.md` (Rattray's collected version, optional).

### Cinderella variant linked by tale type

`content/stories/yeh-shen/index.yaml`:

```yaml
slug: yeh-shen
title: "Yeh-Shen"
form: prose
genre: folklore
timePeriod: "9th century"
approxYear: 850
language: zh
isOralTradition: false
region:
  name: "Tang dynasty China"
  countryCode: CN
  lat: 34.3
  lng: 108.9
cycle: null
episode: null
variantLabel: null
taleType: "ATU 510A"
tags: []
author: "Duan Chengshi"
authorVisible: true
collector: null
translator: "Claude Opus 4.7 (2026-04-26)"
sourceTranslator: null
provenance:
  kind: canon
  source: wikisource
  sourceUrl: "..."
  importedAt: "2026-04-26T00:00:00Z"
media: []
license: "CC-BY-SA-4.0"
createdAt: "2026-04-26T00:00:00Z"
```

Other ATU 510A entries (Rhodopis, Cendrillon, Aschenputtel, Tam and Cam) all share `taleType: "ATU 510A"`, enabling cross-cultural variant views on the map.

### Personal history submission

`content/stories/a-grandmother-in-lahore-1947/index.yaml`:

```yaml
slug: a-grandmother-in-lahore-1947
title: "A Grandmother in Lahore, 1947"
form: prose
genre: personal
timePeriod: "1947"
approxYear: 1947
language: en
isOralTradition: false
region:
  name: "Lahore"
  countryCode: PK
  lat: 31.5
  lng: 74.3
cycle: null
episode: null
variantLabel: null
taleType: null
tags: ["partition-1947"]
author: null
authorVisible: false
collector: null
translator: null
sourceTranslator: null
provenance:
  kind: submission
  source: submission
  sourceUrl: null
  importedAt: "2026-04-26T00:00:00Z"
media: []
license: "CC-BY-SA-4.0"
submittedByHash: "sha256:..."
createdAt: "2026-04-26T00:00:00Z"
```

Files: `en.md`.

### Song / ballad

`content/stories/john-henry/index.yaml`:

```yaml
slug: john-henry
title: "John Henry"
form: song
genre: folklore
timePeriod: "Late 19th century"
approxYear: 1880
language: en
isOralTradition: true
region:
  name: "West Virginia, USA"
  countryCode: US
  lat: 37.8
  lng: -80.5
cycle: null
episode: null
variantLabel: null
taleType: null
tags: ["work-song", "steel-driving"]
author: "American oral tradition"
authorVisible: true
collector: null
translator: null
sourceTranslator: null
provenance:
  kind: canon
  source: gutenberg
  sourceUrl: "..."
  importedAt: "2026-04-26T00:00:00Z"
media:
  - kind: audio
    url: "https://cdn.humanityarchived.com/audio/john-henry-recording.mp3"
    caption: "Field recording, 1932"
license: "Public Domain"
createdAt: "2026-04-26T00:00:00Z"
```

Files: `en.md` (lyrics).

## Migration notes

The current `src/lib/schema.ts` and `src/lib/stories.ts` predate this spec. Differences to reconcile:

- File layout changes from one `.md` per story to a directory per story with `index.yaml` and per-language body files.
- The `translations: [{language, body, auto}]` array is replaced by sibling language files. The `auto` boolean is replaced by the unified `translator` field naming the actual translator.
- New fields: `form`, `cycle`, `episode`, `variantLabel`, `taleType`, `tags`, `collector`, `sourceTranslator`, `isOralTradition`, `provenance`, `media`.
- The `region.lng` field name is preserved to match existing code.

The migration is safe to perform now because `content/stories/` is empty.
