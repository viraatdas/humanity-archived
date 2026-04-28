# Seed Stories: Curation Manifest

Cold-start seed for Humanity Archived. Roughly 37 cultures, 250-300 stories total. Every entry is sourceable from public-domain canon (Wikisource, Project Gutenberg, sacred-texts.com, Bureau of American Ethnology reports).

This document is a working draft, not yet code. Read it as a curation list to react to: cut entries, add traditions you want represented, change weights. Once locked, each section becomes a `seeds/<slug>.json` manifest the import pipeline reads.

Conventions used below:
- **cycle:** the tradition slug used in `index.yaml`
- **count:** target number of stories from this tradition
- **source pool:** the PD collections the importer pulls from
- **(verify):** PD English text is thin or contested, needs source check before import
- **[ATU 510A]:** Cinderella tale-type, cross-cultural cluster

The Cinderella tale-type cluster is highlighted across ~9 traditions to anchor a "same story, many places" feature on the map.

---

## Africa (intentionally over-weighted)

### Akan / Ashanti, Ghana
- cycle: `anansi`
- count: 15
- source pool: R.S. Rattray, *Akan-Ashanti Folk-Tales* (1930); Barker & Sinclair, *West African Folk-Tales* (1917)
- episodes: How Anansi Got the Sky-God's Stories, Anansi and the Plantain Tree, How Spider Got a Bald Head, Anansi and the Pot of Wisdom, Why Spiders Hide in Corners, Anansi and Tiger, Anansi and the Yam, How Spider Read the Sky-God's Thoughts
- notes: rich PD pool, oral-tradition flag set, collector field credits Rattray

### Yoruba, Nigeria
- cycle: null (standalones with `tags: ["yoruba"]`)
- count: 10
- source pool: M.I. Ogumefu, *Yoruba Legends* (1929); Elphinstone Dayrell, *Folk Stories from Southern Nigeria* (1910)
- stories: How Death Came to the Yoruba, The Tortoise and the Birds, Why the Bat Flies at Night, How the Tortoise Cracked His Shell, Origin of the Yoruba People, The Hunter and His Magical Wives

### Zulu, South Africa
- cycle: null
- count: 8
- source pool: Henry Callaway, *Nursery Tales, Traditions, and Histories of the Zulus* (1868)
- stories: Uthlakanyana the Trickster, The Story of Umkxakaza-Wakogingqwayo, The Girl and the Cannibal, How the Hyena Was Tricked

### Egyptian (ancient)
- cycle: `ancient-egypt-tales`
- count: 10
- source pool: Petrie / Wallis Budge collections; Wikisource has Tales of Magicians, Tale of Sinuhe, Tale of Two Brothers, Eloquent Peasant, Wenamun, Setne stories, Westcar Papyrus
- stories: The Tale of Sinuhe, The Tale of the Two Brothers, The Eloquent Peasant, The Shipwrecked Sailor, The Doomed Prince, Setne Khamwas and Naneferkaptah, The Westcar Papyrus tales (Khufu and the Magicians), The Contendings of Horus and Seth
- period: spans roughly 2000 BCE to 100 CE; each story dated separately

### Ethiopian
- cycle: null
- count: 5
- source pool: Wallis Budge, *The Queen of Sheba and Her Only Son Menyelek* (Kebra Nagast, 1922); standalone folktale collections
- stories: The Lion's Whisker, Solomon and the Queen of Sheba, How Menelik Brought the Ark to Ethiopia
- (verify): older PD ethnographic collections of Amharic folktales are limited

### Berber / Amazigh, North Africa
- cycle: null
- count: 5
- source pool: René Basset, *Contes berbères* (1887, French original PD); Frobenius collections (early 20th c.)
- stories: trickster jackal tales, the Seven-Headed Ogre, origin stories of the Atlas peoples
- (verify): English PD translations are sparse; may need to translate Basset's French via the modern translator step

---

## Middle East / West Asia

### Mesopotamian
- cycle: `gilgamesh`
- count: 8
- source pool: Wikisource has multiple PD Gilgamesh translations (R. Campbell Thompson 1928); Enuma Elish (L.W. King 1902); Descent of Inanna / Ishtar
- episodes: Gilgamesh and Enkidu's Friendship, Battle with Humbaba, Bull of Heaven, Death of Enkidu, Search for Immortality, The Flood (Utnapishtim)
- standalones: Enuma Elish (creation), Descent of Ishtar to the Underworld

### Persian / Iranian
- cycles: `shahnameh`, `nights`
- count: 15
- source pool: Warner & Warner, *The Sháhnáma of Firdausí* (1905-1925, 9 vols, full PD); Edward Lane / Richard Burton / John Payne translations of *1001 Nights* (all PD); Edward FitzGerald *Rubaiyat*; Attar *Conference of the Birds* (Smith translation PD)
- shahnameh episodes: Rostam and Sohrab, Seven Trials of Rostam, Bijan and Manijeh, Zal and Rudabeh, Kaveh the Blacksmith, Death of Siyavash
- nights stories: Aladdin, Ali Baba and the Forty Thieves, Sindbad the Sailor (selected voyages), The Fisherman and the Jinni, The Three Apples
- standalones: excerpt from Conference of the Birds, key Rubaiyat quatrains

---

## South Asia

### Hindu / Sanskrit, India
- cycles: `mahabharata`, `ramayana`, `panchatantra`, `jataka`
- count: 25 (largest section; this is a reasonable weight given the canonical depth)
- source pool: Kisari Mohan Ganguli, *Mahabharata* (1883-1896, full PD); Ralph T.H. Griffith, *Ramayana* (1870-1874, PD); Stanley Rice / Joseph Jacobs, *Panchatantra* (older translations PD); E.B. Cowell ed., *Jataka* (1895-1907, PD)
- mahabharata episodes: The Dice Game, Bhagavad Gita, Death of Drona, Death of Karna, Kurukshetra War, Bhima vs Duryodhana
- ramayana episodes: Rama's Exile, Sita's Abduction, Hanuman's Leap to Lanka, Battle of Lanka, Rama's Return
- panchatantra fables (~8): The Blue Jackal, The Talkative Tortoise, The Lion-Makers, The Brahman and the Mongoose, The Crows and the Owls
- jataka tales (~6): The Hare's Sacrifice, The Monkey King, The Six-Tusked Elephant

### Tamil, South India
- cycle: null
- count: 5
- source pool: G.U. Pope, *Sacred Kurral of Tiruvalluva-Nayanar* (1886, PD); V.R. Ramachandra Dikshitar / others on Silappatikaram
- stories: Selected Thirukkural verses on virtue and love, Silappatikaram episodes (the anklet and Kannagi's wrath)
- (verify): Silappatikaram English PD translations are partial

### Tibetan
- cycle: `gesar`
- count: 5
- source pool: Alexandra David-Néel, *The Superhuman Life of Gesar of Ling* (1933, contested PD); older partial translations
- episodes: Gesar's Birth and Magical Childhood, Battle with Lutzen, Subjugation of the Demon King of the North
- (verify): full PD English Gesar text is limited

### Sri Lankan / Sinhala
- cycle: null
- count: 3
- source pool: H. Parker, *Village Folk-Tales of Ceylon* (1910-1914, 3 vols, PD)
- stories: Andare the trickster tales, jataka-derived Sinhala variants

---

## East Asia

### Chinese
- cycles: `liaozhai`, `journey-to-the-west`, `three-kingdoms`
- count: 18
- source pool: Herbert Giles, *Strange Stories from a Chinese Studio* (Pu Songling, 1880, PD); Charles Brewitt-Taylor, *Romance of the Three Kingdoms* (1925, PD); various early Journey to the West translations; classical myth collections
- liaozhai stories (~10): The Painted Skin, Nie Xiaoqian, The Magic Pillow, Cricket Boy, The Taoist of Lao Mountain, Lotus Girl, The Tiger of Zhao Cheng
- journey-to-the-west episodes (~4): Birth of Sun Wukong, Havoc in Heaven, The Five-Finger Mountain, Journey Begins
- standalones: Pangu Creates the World, Nüwa Mends the Sky, Houyi Shoots the Suns, Chang'e Flies to the Moon, **Yeh-Shen** [ATU 510A: Cinderella variant]

### Japanese
- cycles: `kojiki`, `kwaidan`
- count: 12
- source pool: Basil Hall Chamberlain, *Kojiki* (1882, PD); Lafcadio Hearn, *Japanese Fairy Tales* (1898) and *Kwaidan* (1904, PD); Yei Theodora Ozaki, *Japanese Fairy Book* (1903, PD)
- kojiki episodes: Izanagi and Izanami's Creation, Amaterasu in the Cave, Slaying of Yamata no Orochi, Yamato Takeru's Quests
- kwaidan stories (~5): Yuki-Onna (Snow Woman), Mujina (Faceless Ghost), Hoichi the Earless, The Story of Mimi-Nashi-Hoichi, Rokuro-Kubi
- standalones: Momotaro (Peach Boy), Urashima Taro, Princess Kaguya (Bamboo Cutter), The Tongue-Cut Sparrow, Issun-Boshi (Inch Boy)

### Korean
- cycle: null
- count: 6
- source pool: William Elliot Griffis, *Korean Fairy Tales* (1922, PD); James S. Gale's *Korean Folk Tales* (1913, PD)
- stories: Tangun the Founding King, The Faithful Tiger, Heungbu and Nolbu, **Kongjwi and Patjwi** [ATU 510A], The Frog That Cried for His Mother, The Woodcutter and the Heavenly Maiden

### Mongolian
- cycle: null
- count: 4
- source pool: older partial translations of *Secret History of the Mongols*; Mongolian folktale collections (Jeremiah Curtin, *A Journey in Southern Siberia*, 1909, PD)
- stories: Birth of Genghis Khan (Secret History excerpt), The Wise Hare, trickster fox tales
- (verify): full Secret History PD translations are partial

---

## Southeast Asia

### Vietnamese
- cycle: null
- count: 5
- source pool: late 19th c. ethnographic collections; selected modern PD-eligible English summaries
- stories: **Tam and Cam** [ATU 510A], The Watermelon (Mai An Tiem), Saint Giong, Lac Long Quan and Au Co (founding myth), The Story of Banh Chung
- (verify): Vietnamese folktale PD English translations are thin; may rely on French PD sources translated forward

### Indonesian / Javanese / Balinese
- cycle: null
- count: 5
- source pool: Dutch colonial collections (Brandes, Juynboll); Wikisource Indonesian-language entries
- stories: Sangkuriang, Malin Kundang, **Bawang Putih and Bawang Merah** [ATU 510A], Timun Mas, The Legend of Lake Toba

### Thai / Filipino
- cycle: null
- count: 3 each (6 total)
- source pool: Mabel Cook Cole, *Philippine Folk Tales* (1916, PD); Sunthorn Phu's Phra Aphai Mani (older PD translations partial)
- Filipino: Maria Makiling, The Monkey and the Turtle, How the World Was Made
- Thai: Phra Aphai Mani episodes, The Story of Sang Thong

---

## Europe

### Greek (ancient)
- cycles: `aesop`, `iliad`, `odyssey`, `heracles`, `theseus`
- count: 20
- source pool: George Fyler Townsend, *Aesop's Fables* (1867, PD); Alexander Pope or Samuel Butler translations of *Iliad* and *Odyssey* (PD); Hesiod *Theogony* and *Works and Days* (Evelyn-White 1914, PD); Apollodorus *Library*
- aesop fables (~10): The Wolf and the Crane, The Tortoise and the Hare, The Fox and the Grapes, The Boy Who Cried Wolf, The North Wind and the Sun, The Ant and the Grasshopper, The Lion and the Mouse, The Crow and the Pitcher
- iliad episodes (~3): Wrath of Achilles, Hector's Death, Patroclus's Funeral Games
- odyssey episodes (~3): Cyclops, Sirens and Scylla, Return to Ithaca
- heracles episodes (~3): Nemean Lion, Hydra, Cerberus
- standalones: Pandora's Jar, Prometheus and Fire, Theseus and the Minotaur, **Rhodopis** [ATU 510A: Strabo's Egypto-Greek Cinderella]

### Roman
- cycle: `aeneid`
- count: 5
- source pool: John Dryden, *Aeneid* (1697, PD); various PD translations of Ovid *Metamorphoses*
- aeneid episodes (~3): Fall of Troy, Dido and Aeneas, Aeneas in the Underworld
- standalones: Pyramus and Thisbe (Ovid), Cupid and Psyche (Apuleius)

### Norse / Icelandic
- cycles: `eddas`, `volsunga`
- count: 10
- source pool: Arthur Gilchrist Brodeur, *Prose Edda* (1916, PD); Henry Adams Bellows, *Poetic Edda* (1923, PD); William Morris, *Volsunga Saga* and *Story of Burnt Njal* (PD)
- eddic episodes (~6): Creation from Ymir, Death of Baldr, Thor's Journey to Utgard, Ragnarok, Mead of Poetry, Loki's Binding
- volsunga episodes (~3): Sigurd and Fafnir, Brynhild's Wrath, Fall of the Niflungs
- standalone: Njal's Saga key episode

### Celtic (Irish, Welsh)
- cycles: `ulster`, `mabinogion`
- count: 8
- source pool: Lady Augusta Gregory, *Cuchulain of Muirthemne* (1902, PD); Lady Charlotte Guest, *Mabinogion* (1849, PD)
- ulster episodes (~3): Birth of Cuchulain, Cattle Raid of Cooley (Táin Bó Cúailnge), Death of Cuchulain
- mabinogion branches (~3): Pwyll Prince of Dyfed, Branwen Daughter of Llyr, Math Son of Mathonwy
- standalones: Voyage of Bran, Children of Lir, Tír na nÓg

### Slavic (Russian)
- cycle: `byliny`
- count: 10
- source pool: Leonard Magnus, *Russian Folk-Tales* (1916, PD, draws on Afanasyev); James Curtin, *Myths and Folk-tales of the Russians* (1903, PD)
- byliny (heroic poems) (~3): Ilya Muromets and Solovei the Brigand, Dobrynya and the Dragon, Sadko of Novgorod
- standalones: Baba Yaga, **Vasilisa the Beautiful** [ATU 510A], Firebird and Tsarevich Ivan, Snow Maiden, Koschei the Deathless, The Frog Princess

### Germanic
- cycle: `grimm`
- count: 12
- source pool: Margaret Hunt, *Grimm's Household Tales* (1884, PD); Daniel B. Shumway, *Nibelungenlied* (1909, PD)
- grimm tales (~10): Hansel and Gretel, Rapunzel, Snow White, Rumpelstiltskin, The Bremen Town Musicians, The Frog King, **Aschenputtel** [ATU 510A], Briar Rose (Sleeping Beauty), The Fisherman and His Wife, The Goose Girl
- standalones: Nibelungenlied selected adventures (Siegfried, Kriemhild's Revenge)

### Scandinavian (Danish, Norwegian, Finnish)
- cycle: `kalevala`
- count: 10
- source pool: Mary Howitt and others, *Andersen's Tales* (1846 onward, PD); George Webbe Dasent, *Popular Tales from the Norse* (1859, Asbjørnsen and Moe, PD); John Martin Crawford, *Kalevala* (1888, PD)
- andersen (~5): The Little Mermaid, The Ugly Duckling, The Princess and the Pea, The Emperor's New Clothes, The Little Match Girl
- norwegian (~2): Three Billy Goats Gruff, East of the Sun and West of the Moon
- kalevala episodes (~3): Birth of Väinämöinen, Forging of the Sampo, Death of Lemminkäinen

### Italian
- cycle: `pentamerone`
- count: 5
- source pool: John Edward Taylor / Norman Penzer translations of Basile's *Pentamerone* (older translations PD); James Macmullen Rigg, *Decameron* (1903, PD)
- pentamerone tales (~3): Petrosinella (Rapunzel ancestor), **La Gatta Cenerentola** [ATU 510A: the earliest European Cinderella, 1634], Sun, Moon, and Talia
- decameron tales (~2): selected key novellas

---

## Americas

### Mesoamerican (Maya)
- cycle: `popol-vuh`
- count: 6
- source pool: Lewis Spence, *Popol Vuh* (1908, partial, PD); Goetz-Morley translation (1950) is contested PD; Brasseur de Bourbourg's 1861 French translation is fully PD
- episodes: Creation of the World, The Hero Twins (Hunahpu and Xbalanque), Defeat of Vucub-Caquix, Visit to Xibalba, The Ball Game in the Underworld
- (verify): full PD English text is partial; may translate Brasseur's French via the translator step

### Aztec / Nahuatl
- cycle: null
- count: 5
- source pool: Bernardino de Sahagún, *Florentine Codex* (older partial English translations PD); Lewis Spence, *Myths of Mexico and Peru* (1913, PD)
- stories: Quetzalcoatl and the Creation, The Five Suns, Birth of Huitzilopochtli, Tezcatlipoca and the Mirror, How Music Came to the World

### Andean (Inca / Quechua)
- cycle: null
- count: 4
- source pool: Garcilaso de la Vega, *Royal Commentaries of the Yncas* (1609, English trans by Markham 1869, PD); Lewis Spence, *Myths of Mexico and Peru* (1913, PD)
- stories: Manco Capac and Mama Ocllo (origin of the Inca), Viracocha Creates the World, The Boy Who Became a Llama, El Dorado

### North American Indigenous
- cycle: null (per-nation tags)
- count: 14 across 7 nations
- source pool: Bureau of American Ethnology reports (Boas, Mooney, Cushing, Densmore: all PD as US government publications); Stith Thompson, *Tales of the North American Indians* (1929, contested PD)
- Lakota (2): White Buffalo Calf Woman, Iktomi the Trickster
- Navajo (2): Spider Woman, First Man and First Woman
- Iroquois (2): Sky Woman Falls, Hiawatha and the Peacemaker (Great Law)
- Inuit (2): Sedna, Sea Mother; Raven Steals the Light
- Tlingit / Haida (2): Raven Steals the Sun, Salmon Boy
- Cherokee (2): How the World Was Made, The First Strawberries
- Hopi / Pueblo (2): Spider Grandmother, Emergence from the Lower Worlds

### Brazilian / Tupi-Guarani
- cycle: null
- count: 3
- source pool: 19th c. ethnographic accounts; *Brazilian Tales* (Goldberg, 1921, PD)
- stories: Boitatá the Fire-Serpent, Curupira the Forest Guardian, Iara the Water Mother
- (verify): English PD limited

### Caribbean
- cycle: null
- count: 3
- source pool: Elsie Clews Parsons, *Folk-Lore of the Antilles* (1933, BAE bulletin, PD)
- stories: Compère Lapin (Brer Rabbit cousin), Caribbean Anansi tales, La Diablesse / Soucouyant

---

## Oceania

### Aboriginal Australian
- cycle: null
- count: 5
- source pool: K. Langloh Parker, *Australian Legendary Tales* (1896, PD)
- stories: Tiddalik the Frog, How the Kangaroo Got Her Pouch, Rainbow Serpent (general public version), Bunyip, Why the Crow Is Black
- notes: Parker's collection is general public folklore, no restricted ceremonial material

### Māori, New Zealand
- cycle: `maui`
- count: 5
- source pool: Sir George Grey, *Polynesian Mythology* (1855, PD); Johannes Andersen, *Maori Tales of the Long Ago* (1928, PD)
- maui episodes: Maui Slows the Sun, Maui Fishes Up the North Island, Maui Brings Fire to the World, Maui's Death
- standalones: Rangi and Papa (Sky Father and Earth Mother)

### Polynesian (Hawaiian, Samoan, Tahitian, Tongan)
- cycle: null
- count: 6
- source pool: William Drake Westervelt, *Legends of Old Honolulu*, *Hawaiian Legends of Volcanoes*, etc. (1910s, PD)
- stories: Pele the Volcano Goddess, Hiʻiaka and Lohiʻau, Maui (Hawaiian variant), Hina the Moon, The Menehune, Origin of the Hawaiian Islands

---

## Cross-cultural showcase: Cinderella (ATU 510A)

Stories tagged `taleType: "ATU 510A"` from the lists above, anchoring a featured "Cinderella across the world" map view at launch:

- **Yeh-Shen** (Tang dynasty China, ~9th c., earliest known recorded Cinderella)
- **Rhodopis** (Greek-Egyptian, recorded by Strabo ~1st c. BCE, oldest of all)
- **La Gatta Cenerentola** (Naples, Basile 1634, earliest European)
- **Cendrillon** (Perrault 1697, France) — to be added under European folklore
- **Aschenputtel** (Grimm, German)
- **Vasilisa the Beautiful** (Russian, Afanasyev)
- **Tam and Cam** (Vietnamese)
- **Kongjwi and Patjwi** (Korean)
- **Bawang Putih and Bawang Merah** (Indonesian)

Nine variants from nine cultures, all linked at the schema level.

---

## Tally

- ~37 cultures and sub-cultures
- ~280 stories across all sections
- 7 genres represented (mythology, folklore, oral history, religious narrative, historical account, personal history, epic). Personal/oral history will mostly come from submissions, not seed.
- 3 forms (prose dominant; verse for Sanskrit and Persian epics, Norse eddas, Tamil Sangam; song for sea shanties / ballads if added later)
- Africa, Indigenous, and Asian traditions deliberately weighted to counter the typical Greek/Norse/Grimm bias of Western archives

## Open questions

- **Add Hebrew Bible / Tanakh narratives?** Genesis stories (Cain and Abel, Noah, Joseph), Job, Esther are clearly genre `religious` and PD in many translations. Currently absent from this list. ~5 entries.
- **Add Quranic narratives?** Yusuf, Maryam, the Cave of Sleepers. ~3 entries. PD English translations exist (Pickthall 1930).
- **Buddhist beyond Jataka?** Sutra parables, Zen koans (Mumonkan, Blue Cliff Record older translations PD). ~3 entries.
- **Sufi parables?** Rumi's Mathnavi (Whinfield 1898 PD), Attar Conference of the Birds, Nasreddin tales. ~5 entries.
- **Songs / ballads in v1 seed?** Child Ballads (PD), sea shanties, John Henry, Casey Jones. Schema supports `form: song`. ~5 entries if yes.
- **Hebrew midrash and Talmudic tales?** Folk-narrative beyond the Bible itself. ~3 entries.

These would push the total from ~280 to ~310 if all yes. They are absent from the current list to keep it tight, not because they are unwanted.
