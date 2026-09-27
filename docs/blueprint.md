# Turn 3,000 sentences into self-running practice

The app should be an automated **retrieval-and-spacing engine**, not a phrasebook. Each day it turns the learner's minutes budget into one session. In that session, curated sentences are recalled (never just re-read), checked objectively, followed at once by native audio, and rescheduled by **FSRS-6**. FSRS-6 is the open-source scheduler Anki runs today. On a 10,000-collection benchmark it predicts memory better than SM-2 for **99.6% of users**, while Duolingo's published half-life model scores worse than a constant baseline. The core rests on the two best-replicated findings in learning science: spaced practice, and retrieval practice with feedback. Three supports sit on top: prompted comparison of sentence patterns, listening-first training with many voices, and one-line rules shown *after* examples. One requirement needs reframing. A literal ranking of the "3,000 most common sentences" is dominated by "Hey.", "Oh." and "No!". Those sentences average **2.3 words** and cover only **13.5%** of subtitle sentences. The app should instead rank *words and chunks* by frequency and build one sentence per new item, grouped into pattern families across four CEFR-mapped bands. The honest ceiling is **B1-range vocabulary, not B1 skill**. By our estimate the full path costs about **225 hours whatever the daily pace**, which is roughly 10 months at 45 minutes a day and falls inside Goethe's guided-hours range for A2. One backend developer can build it with free (MIT/BSD) FSRS libraries, about **$15 per language** of pre-generated neural audio and about **$0.0015 per graded speaking attempt**, starting from a German MVP of the first 1,000 sentences.

*Evidence labels used throughout:*

| Label | Meaning |
|---|---|
| **Strong** | Replicated or meta-analytic evidence |
| **Moderate** | Smaller meta-analyses, mixed results, or a few controlled studies |
| **Weak** | A single small study, or a study verified only by its title |
| **Company** | A vendor claim or internal A/B result |
| **Inference** | The research team's own synthesis, arithmetic or design choice |

## 1. The app in one paragraph: a daily "Start" button over a curated sentence path

The learner makes four choices once: target language, gloss language, a daily minutes budget, and an everyday cue ("after breakfast"). After that, the app opens to a single button: **"Start · 22 min."** Three automated systems sit behind that button:

- **A content factory** has already produced about 3,000 sentences per language. Each sentence introduces one new word or chunk and belongs to a pattern family (*Ich hätte gern ___*). Each is tagged by theme and CEFR band and voiced by several speakers. Where the meaning can be pictured, it is paired with an image of the situation.
- **A scheduler (FSRS-6)** tracks two memories per sentence, "can I understand it by ear?" and "can I produce it?", and predicts when each will fade.
- **A planner** fills today's session with the reviews most at risk. It then adds as many new sentences as the budget can absorb without creating a future pile-up.

New patterns arrive as small families. The learner is prompted to compare them before a one-line rule appears, and later they are mixed with their look-alikes. Progress shows as bands, can-do checkpoints and a forecast finish range. A missed week triggers a recovery plan, not a wall of 800 overdue cards.

| Your requirement | How the blueprint meets it | Section |
|---|---|---|
| Fully automated, no planning | Minutes budget becomes one generated session; FSRS decides what is due; backlog and breaks handled by fixed rules | 5, 9 |
| Science-based learning system | Core is spacing plus retrieval with feedback; comparison, perception training and short explicit notes as supports | 2 |
| A roadmap | 4 bands, 8 can-do checkpoints, CEFR mapping, forecast finish range | 4 |
| Active recall | Every review is a recall attempt; production is tracked separately from comprehension | 5 |
| Spaced repetition | FSRS-6 at a 90% retention target, with per-user optimisation | 5 |
| Voice: listen and test pronunciation | 2–4 voices, slow-then-natural audio, dictation, shadowing, scored speaking with word-level feedback | 6 |
| Images and videos from the web | One situation image per concrete sentence; captioned clips unlocked at intermediate level; storage rules follow licences | 7 |
| Always compare and clarify | Pattern families, "what's the same?" prompts, rule after comparison, one-change pairs, L1/L2 alignment strip, one-line task instructions | 8 |

## 2. Spacing and retrieval with feedback do the heavy lifting; twelve supporting principles set the details

Dunlosky and colleagues reviewed ten common study techniques. Only two, **practice testing and distributed practice**, earned a "high utility" rating, because "they benefit learners of different ages and abilities." Rereading and highlighting rated low ([Dunlosky et al. 2013](https://journals.sagepub.com/doi/10.1177/1529100612453266)). The learning system is therefore a retrieval-and-spacing engine first, and everything else plays a supporting role. The table gives each principle, the evidence, its strength, and exactly what the app does with it.

| Principle | What the evidence says | Strength | What the app does |
|---|---|---|---|
| **Spacing** | The best review gap is about 10–30% of the time you want to remember for, falling to about 5% at one year ([Cepeda 2008](https://files.eric.ed.gov/fulltext/ED505660.pdf)). Spacing has a medium-to-large effect in L2 learning, and equal vs. expanding gaps did not differ ([Kim & Webb 2022](https://ouci.dntb.gov.ua/en/works/ldvWmgB7/)). | Strong | FSRS-6 schedules every sentence; the learner never picks review dates |
| **Retrieval practice** | g = 0.50 across 159 effects ([Rowland 2014](https://courseware.epfl.ch/assets/courseware/v1/fdde2f0aa590bf3b1324077a6bf1540c/asset-v1%3AEPFL%2BDEMO%2B2020%2Btype%40asset%2Bblock/Rowland2014-meta-analysis.pdf)). In classrooms, g = 0.644 when the subject is a language, and effects rise with more test repetitions ([Yang et al. 2021](https://gwern.net/doc/psychology/spaced-repetition/2021-yang.pdf)). | Strong | Every review asks for an answer before showing it; the core loop has no "re-read" mode |
| **Feedback after every attempt** | g = 0.73 with feedback vs. 0.39 without. When success is ≤50% and no feedback follows, g = 0.03, i.e. no benefit ([Rowland 2014](https://courseware.epfl.ch/assets/courseware/v1/fdde2f0aa590bf3b1324077a6bf1540c/asset-v1%3AEPFL%2BDEMO%2B2020%2Btype%40asset%2Bblock/Rowland2014-meta-analysis.pdf)). | Strong | The correct answer and native audio appear after every attempt, right or wrong |
| **Successive relearning, few same-day repeats** | One correct recall in each of three spaced sessions beat three recalls in one session: **68% vs. 26%** one-week retention ([Rawson & Dunlosky 2022](https://journals.sagepub.com/doi/full/10.1177/09637214221100484)). Per minute spent, one within-session retrieval was the most efficient ([Nakata 2017](https://eric.ed.gov/?id=EJ1164199)). | Strong (vocabulary) | 1–2 recalls on day 1 (steps at 1 and 10 minutes), then one recall per later session |
| **Sleep between learning and relearning** | Sleep roughly halved the relearning trials needed (3.05 vs. 5.80) and more than doubled 6-month recall (8.67 vs. 3.35 of 16) in a 40-person study ([Mazza et al. 2016](https://www.hendrix.edu/uploadedFiles/Academics/Faculty_Resources/2016_FFC/Learn%20then%20sleep.pdf)) | Weak | The first real review always lands the next day; an optional evening slot for new sentences |
| **Recall-type tests over recognition** | In lab studies, cued recall g = 0.61 vs. recognition 0.29 ([Rowland 2014](https://courseware.epfl.ch/assets/courseware/v1/fdde2f0aa590bf3b1324077a6bf1540c/asset-v1%3AEPFL%2BDEMO%2B2020%2Btype%40asset%2Bblock/Rowland2014-meta-analysis.pdf)). In classrooms, matching and multiple choice scored high ([Yang et al. 2021](https://gwern.net/doc/psychology/spaced-repetition/2021-yang.pdf)). | Mixed | Comprehension comes first; production (saying or typing) unlocks once comprehension is stable |
| **Objective checks over self-ratings** | Making judgments of learning did not improve memory (g = 0.054) ([Double et al. 2018](https://durham-repository.worktribe.com/output/2253677/a-meta-analysis-and-systematic-review-of-reactivity-to-judgements-of-learning)). Overconfident self-evaluation undermines learning ([Dunlosky & Rawson 2012](https://eric.ed.gov/?id=EJ964388), verified by title only). | Moderate | Typed and spoken answers are graded automatically; self-grading happens only after the answer is revealed |
| **Deliberate chunk learning** | Both natives and learners read formulaic sequences faster ([Conklin & Schmitt 2008](https://academic.oup.com/applij/article-abstract/29/1/72/258919)). Incidental chunk learning "has overall not been shown to be effective" ([Boers & Lindstromberg, cited in EJ1174049](https://files.eric.ed.gov/fulltext/EJ1174049.pdf)). | Moderate | Each sentence's chunk is highlighted and studied on purpose |
| **Short explicit rules, after examples** | Explicit instruction beats implicit for both simple and complex forms ([Spada & Tomita 2010](https://eric.ed.gov/?id=EJ883419)), though the gap shrinks once moderators are considered ([Kang et al. 2019](https://journals.sagepub.com/doi/10.1177/1362168818776671)). Stating the principle *after* a comparison gave d = 1.18, vs. 0.37 when stated before ([Alfieri et al. 2013](https://www.academia.edu/3708913/Learning_through_Case_Comparisons_A_Meta_Analytic_Review)). | Strong / moderate | A one-line rule card appears only after a comparison task |
| **Block to introduce; interleave confusable grammar** | Interleaving g = 0.42 overall, but −0.39 for word learning ([Brunmair & Richter 2019](https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf)). Mixing confusable tenses gave d = 0.64 on a delayed test ([Nakata & Suzuki 2019](https://www.academia.edu/40127030/Nakata_T_and_Suzuki_Y_2019_Mixing_grammar_exercises_facilitates_long_term_retention_Effects_of_blocking_interleaving_and_increasing_practice_Modern_Language_Journal_103_629_647)). | Moderate | A new family is shown together once; later reviews mix it with its look-alikes |
| **Perception before production, many voices** | High-variability perceptual training gives g = 0.67–0.92 and generalizes to new voices ([Uchihara et al. 2025](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/high-variability-phonetic-training-hvpt-a-metaanalysis-of-l2-perceptual-training-studies/6ABB8C1F32D88D53EA8D05A4565E76F6)). It carries over to production at g = 0.49–0.66 ([Uchihara et al. 2024](https://www.cambridge.org/core/journals/applied-psycholinguistics/article/does-perceptual-high-variability-phonetic-training-improve-l2-speech-production-a-metaanalysis-of-perceptionproduction-connection/E38D8F5CE65DC708137B0E95F97C6BC7)). | Strong | Listening and dictation come before speaking; voices rotate across reviews |
| **Images anchor meaning, never replace it** | Pictures did not beat translations for learning L2 words, and they inflated learners' confidence ([Carpenter & Olson 2012](https://eric.ed.gov/?id=EJ965468)). Irrelevant "seductive" images cost learning: g = −0.33 ([Sundararajan & Adesope 2020, via summary](https://theeconomyofmeaning.com/2020/03/02/how-a-cartoon-in-a-textbook-can-hurt-learning-a-new-meta-analysis-of-the-seductive-details-effect/)). | Moderate | The gloss is always shown; one relevant image; every image is followed by retrieval |
| **Varied contexts** | Four different contexts beat one repeated context: 43% vs. 29% ([Bolger et al. 2008](https://sites.pitt.edu/~perfetti/PDF/Context%20variation%20Bolger%20et%20al.pdf)). d = 0.44 across 20 studies, only 3 of them in L2 ([Chen et al. 2026](https://www.cambridge.org/core/journals/applied-psycholinguistics/article/effect-of-contextual-diversity-on-l1-and-l2-word-learning-a-systematic-review-and-metaanalysis/56CB12725024BBE5DD57F374008F193D)). | Moderate | Each pattern comes back in 3+ situations, voices and images |
| **A balanced diet** | Direct study of language items should take no more than about 25% of learning time ([Nation's four strands](https://www.sinosplice.com/life/archives/2019/06/12/the-four-strands-of-a-balanced-language-course)) | Expert framework | The app presents itself as the deliberate-study strand and points the learner to listening and reading outside it |

Several popular features are **left out on purpose**. Confidence taps before answering do not improve memory, and learning L2 forms is like learning *unrelated* word pairs, where the reactivity effect was zero ([Double et al. 2018](https://durham-repository.worktribe.com/output/2253677/a-meta-analysis-and-systematic-review-of-reactivity-to-judgements-of-learning)). A passive "study mode" competes with retrieval for time. Drilling one item many times in a sitting wastes minutes. One real limitation remains: almost all spacing and testing research uses word pairs, not whole sentences. Applying it to sentence cards is an inference, which is why Section 10 insists on logging every review so the app can measure itself.

## 3. The "3,000 most frequent sentences" list is mostly "Hey." and "Oh.", so rank words and chunks instead

Taken literally, the requirement fails on the data. A frequency ranking of whole sentences built from 424 million English subtitle sentences does exist. Its top 20 begin "Hey.", "Oh.", "No!", "Hello?", "Sorry.", "Yeah?". The top 3,000 average **2.3 words** and cover just **13.5%** of all sentence occurrences, and around rank 3,000 sit fragments like "Let me think." and "No, we don't." ([orgtre top sentences](https://raw.githubusercontent.com/orgtre/top-open-subtitles-sentences/main/bld/top_sentences/en_top_sentences.csv)). The underlying corpus is also distorted by translation. Only about 31% of English and 3% of Spanish subtitle files are in the film's original language, and the German top-1,000 correlates only about **0.5** between all files and original-language files ([orgtre/top-open-subtitles-sentences](https://github.com/orgtre/top-open-subtitles-sentences)). So every serious product actually builds "most *useful*" sentences:

- Glossika's original ~3,000 sentences were organized by syntax ([Mezzoguild interview](https://www.mezzoguild.com/glossika-review/)).
- Refold filters a frequency list and gives one new word per example sentence ([Refold](https://refold.la/decks/buy/fundamental-vocabulary-to-learn-spanish)).
- Clozemaster blanks out the rarest word within the top 10,000 ([Clozemaster FAQ](https://www.clozemaster.com/faq)).

Sentences are still the right unit, but for a different reason than usually claimed. A single glossed sentence did not teach word meaning better than a plain word pair ([Webb 2007](https://eric.ed.gov/?id=EJ803465)). The real case for sentences is **nativelike selection**. Native speakers know "hundreds of thousands" of prefabricated sentence stems, and the largest new unit they can encode in one go is "a single clause of eight to ten words" ([Pawley & Syder 1983](https://lextutor.ca/rt/pawley_syder_83.pdf)). Learners trained to notice formulaic sequences were rated more proficient in oral interviews by blind judges ([Boers et al. 2006](https://journals.sagepub.com/doi/abs/10.1191/1362168806lr195oa)). Incidental exposure picks up only 9–18% of target words ([incidental-learning meta-analysis](https://www.cambridge.org/core/journals/language-teaching/article/how-effective-is-second-language-incidental-vocabulary-learning-a-metaanalysis/E38E3468FD2090B1FA3051051DE8E70C)). The app therefore uses sentences to deliver chunks, word order and pronunciation in context, keeps each one to **about 3–12 words**, and teaches them deliberately.

**The recommended definition (Inference):** "the 3,000 most useful sentences" means four layers built from frequency data.

| Layer | Size | Built from | German example |
|---|---|---|---|
| Formula layer | ~100–300 | Real top utterances from subtitle lists plus a survival set | *Entschuldigung!* · *Wie bitte?* · *Ich verstehe das nicht.* |
| Core lemma layer | the remainder, to ~3,000 | Frequency-ranked lemmas (dictionary forms), one new lemma or chunk per sentence | *Ich trinke gern Tee.* (new item: *gern*) |
| Pattern frames | every sentence belongs to one; 3–8 sentences per frame | Grammar and chunk frames sequenced by CEFR level | *Ich hätte gern ___* · *Wo ist ___?* |
| Situation tags | ~11 themes | CEFR domains: courtesy, food and shopping, transport, home, health, work, travel, opinions… | café, train station, doctor |

"One new item per sentence" is a practitioner heuristic, not a tested optimum. The MorphMan add-on reorders cards so each sentence has "exactly one unknown word" ([MorphMan](https://github.com/kaegi/MorphMan/blob/master/README.md)), and Refold claims over 90% of its sentences introduce one new word ([Refold](https://refold.la/decks/buy/fundamental-vocabulary-to-learn-spanish)). No controlled study has compared this ordering with thematic or random ordering. The heuristic is still sensible, because one unknown item in a sentence of about 8 words only works when the item is glossed.

**The content pipeline (researchers' synthesis):**

| Step | What happens | German data and tools | Output |
|---|---|---|---|
| 1. Lexicon | Build a lemma frequency list from subtitles; lemmatize; merge in CEFR word lists where licensed | [FrequencyWords](https://github.com/hermitdave/FrequencyWords) (OpenSubtitles; content CC BY-SA 4.0); [wordfreq](https://github.com/rspeer/wordfreq) as a fallback (frozen at ~2021); spaCy or Stanza for lemmas | Ranked lemmas and chunks |
| 2. Formula layer | Take the top real utterances as the survival set | orgtre German top-sentence list, used for statistics only | 100–300 formulas |
| 3. Candidates | For each lemma or chunk, pull 3–12-token sentences; drop duplicates, mislabeled languages and name-heavy lines | Tatoeba German: **782,122 sentences** ([Tatoeba stats](https://tatoeba.org/en/stats/sentences_by_language)) | Candidate pool |
| 4. Score | Composite of: highest-rank lemma, number of untaught lemmas (target 1), length, grammar level, naturalness | Grammar tagging by LLM or detectors; for comparison, LLM-generated construction labels were ~87% accurate in English ([Glandorf & Meurers](https://github.com/dominikglandorf/LLM-grammar)) | Difficulty per sentence |
| 5. Order | Greedy: at each step pick the sentence that adds exactly one new item at the lowest frequency rank, respects the grammar sequence, and reuses recently taught items | Similar to a DIY Tatoeba pipeline that kept 29,761 clozes from 304,304 pairs ([Borretti](https://borretti.me/article/building-diy-clozemaster)) | Ordered 3,000 |
| 6. Fill gaps | Generate the missing sentences with an LLM limited to a hard vocabulary whitelist | — | Gap sentences |
| 7. Quality check | Back-translation, grammar check, then a native speaker reviews every sentence | — | Approved set |
| 8. Media | Licensed human audio or TTS; one image per meaning | Tatoeba has **32,938** German sentences with audio ([Tatoeba audio](https://tatoeba.org/en/audio/index)) | Versioned content pack |

Step 6 needs hard limits because unconstrained prompting fails. Asked for a CEFR level, GPT-4o hit it only **5% of the time zero-shot and 12.5% one-shot**, turning A1/A2 requests into pre-A1 and B2+ requests into C2 ([ERIC EJ1466280](https://files.eric.ed.gov/fulltext/EJ1466280.pdf)). Constraining output to the learner's vocabulary raised beginner comprehensibility from 39.4% to 83.3% in a six-learner study ([arXiv 2506.04072](https://arxiv.org/html/2506.04072v2)). Step 7 is the real bottleneck. Glossika deletes "as many as 50%" of candidate sentences during screening ([Glossika](https://ai.glossika.com/blog/the-glossika-method)), and Tatoeba's sentences "are not all authentic" ([Wikipedia: Tatoeba](https://en.wikipedia.org/wiki/Tatoeba)).

Licences shape the pipeline too:

| Source | Licence terms | How to use it |
|---|---|---|
| Tatoeba text | CC BY 2.0 FR with a CC0 subset ([Tatoeba downloads](https://tatoeba.org/en/downloads)) | Store the author for attribution |
| Tatoeba audio | Licensed per contributor; some is non-commercial or unlicensed | Drop non-commercial and unlicensed files if the app is paid |
| OPUS / OpenSubtitles | "Individual corpora maintain their own licenses" ([OPUS](https://opus.nlpl.eu/)) | Researchers' recommendation: use for frequency statistics, never ship the sentences |
| KELLY CEFR word lists | Non-commercial ([KELLY](https://ssharoff.github.io/kelly/)) | Needs permission for a paid app |

For "any language," two warnings apply.

**Rank by lemma, not by surface form.** Counting raw word forms in subtitles, the top 3,000 cover **90.1%** of English running words but **85.3%** of German and only **65.3%** of Arabic, where clitics attach to words ([researchers' computation from orgtre word lists](https://github.com/orgtre/top-open-subtitles-sentences)). Lemma-level ranking with a morphological analyzer is therefore mandatory.

**Data is thin for many languages.** Tatoeba has only 68,682 Arabic sentences, and most African and South Asian languages have fewer than 1,000 ([Tatoeba stats](https://tatoeba.org/en/stats/sentences_by_language)). Arabic as a *target* language also forces a choice between MSA and a dialect. German and Dutch (201,265 Tatoeba sentences) are well supplied.

## 4. Four bands and eight checkpoints map the path to the B1 threshold

The CEFR does not specify vocabulary counts, but vocabulary-size studies do give a rough calibration. Out of the 5,000 most frequent lemmas, A1 learners know roughly 900–1,500, A2 learners 1,700–2,200, and B1 learners 2,200–3,300. The samples were small, and French learners needed fewer words than English learners at the same level ([Milton, EUROSLA Monographs](https://www.eurosla.org/monographs/EM01/211-232Milton.pdf)). The bands below are the researchers' synthesis of these figures and should be recalibrated for each language. Can-do wording follows the CEFR scales ([Council of Europe global scale](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale); [CEFR illustrative scales compilation](https://api.macmillanenglish.com/fileadmin/user_upload/Blog_and_Resources/Blogs_and_articles/CEFR-all-scales-and-all-skills.pdf)).

| Band | Sentences | CEFR target | Vocabulary | German focus, with examples | Band-end can-do |
|---|---|---|---|---|---|
| 1. Survival | 1–300 | Pre-A1 → A1 | Formula layer + top ~300 lemmas | Greetings, repair, numbers, prices, directions: *Wie bitte?* · *Was kostet das?* · *Wo ist der Bahnhof?* | Introduce yourself; ask and answer very simple questions with help |
| 2. Foundations | 301–1,000 | A1 | Lemmas up to ~1,000 | Present tense, verb-second order, questions, modal verbs, accusative: *Ich hätte gern einen Kaffee.* · *Heute gehe ich ins Kino.* | "Can interact in a simple way," provided the other person helps |
| 3. Everyday life | 1,001–2,000 | A2 | Lemmas ~1,000–2,000 | Perfekt with *haben*/*sein*, dative, comparisons, requests: *Ich bin nach Hause gegangen.* · *Können Sie das bitte wiederholen?* | "Routine, everyday transactions": shopping, transport, basic work talk |
| 4. Threshold | 2,001–3,000 | A2+ → B1 threshold | Lemmas ~2,000–3,000 | Reasons and opinions with verb-final clauses, Konjunktiv II, narration: *Ich bleibe zu Hause, weil ich müde bin.* · *Wenn ich mehr Zeit hätte, würde ich öfter reisen.* | "Communicate with some confidence on familiar routine and non-routine matters" |

Motivation dips right after each reward and rises as the next goal nears ([Kivetz et al. 2006](https://home.uchicago.edu/ourminsky/Goal-Gradient_Illusionary_Goal_Progress.pdf)). So the roadmap has a small celebration every 100 sentences and a verified checkpoint at eight points:

| Checkpoint | Can-do statement | Verified by |
|---|---|---|
| 100 | Greet, thank, apologize, say you didn't understand, ask for a repeat | Say the right formula for 10 pictured situations |
| 300 | Order food and drink, ask prices and the way | Café and street prompts + an unseen-voice listening check |
| 600 | Describe your day, family and job in the present tense | Picture-description prompts |
| 1,000 (A1) | Handle a simple exchange with a slow, helpful speaker | Full checkpoint test (below) |
| 1,500 | Say what you did yesterday or last weekend | Perfekt prompts, mixing *haben* and *sein* |
| 2,000 (A2) | Shop, book, make an appointment, solve a transport problem | Full checkpoint test |
| 2,500 | Give reasons and simple opinions (*weil*, *dass*, *ich finde*) | Opinion prompts |
| 3,000 (B1 threshold) | Narrate an event, talk about plans and hypotheticals | Full checkpoint test + optional external mock exam |

Each full checkpoint test has three measurable parts (Inference; the thresholds are design choices, not validated cut-offs):

| Part | What it measures | Pass mark |
|---|---|---|
| Retention | True retention on the band's reviews over the last 30 days | ≥ 85% |
| Listening transfer | 20 band sentences in a voice the learner has never heard, answered or typed | ≥ 80% correct |
| Speaking | 10 situation prompts answered with a fitting sentence | At least 8 with ≤ 1 word wrong on automatic speech recognition |

A sentence counts as **"mastered"** when both of its memories have FSRS stability of at least 30 days.

**Honest expectations.** Four facts set the limits:

- **Coverage.** In English, the top 3,000 word families plus proper nouns cover **95.45%** of TV language ([Webb & Rodgers 2009](https://eric.ed.gov/?id=EJ839281)). But 95% coverage still means about **7 unknown words per minute of speech**, and 98% needs 6,000–7,000 families for speech ([Nation 2006](https://www.scienceguide.nl/wp-content/uploads/2017/11/nation-2006-vocabulary.pdf)). Listening tolerates 90–95% coverage better than reading does ([review, EJ1316858](https://files.eric.ed.gov/fulltext/EJ1316858.pdf)).
- **Finishing content is not reaching the level.** Duolingo learners who finished content through the first half of B1 tested only Novice High (Spanish) or Intermediate Low (French) in listening ([Duolingo whitepaper 2022](https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_read_listen_A2_to_B1_2022.pdf)).
- **Official hours.** Goethe estimates **260–490 guided hours to B1 and 450–600 to B2** ([CEFR hours table](https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages)).
- **Our time estimate.** The course costs about 225 hours (Section 5), which falls in Goethe's A2 range of 150–260 hours.

The honest promise is **"a vocabulary and pattern foundation toward A2/B1."** B1 skill needs meaning-focused listening, reading and conversation on top. A learner aiming at a certified B2 should treat this app as the deliberate-study strand of a larger plan, not the plan itself.

## 5. The daily session runs itself: reviews first, one new pattern family, objective grades, FSRS-6 underneath

### The session, step by step

The shares of time below are design estimates (Inference); each step's reason carries its own evidence.

| # | Step | Share of time | What the learner does | Why |
|---|---|---|---|---|
| 1 | Open | — | Sees one number ("Today · 22 min") and a Start button. There is no deck to choose. | Choice overload grows when tasks are hard and people want to save effort ([Chernev et al. 2015](https://www.sciencedirect.com/science/article/abs/pii/S1057740814000916)) |
| 2 | Due reviews | ~60–80% | Answers due items, one exercise each. Confusable patterns are mixed. The two memories of one sentence never fall on the same day. | Retrieval plus spacing; Anki warns that a fixed order "makes it easier to guess the answer based on context" ([Anki manual](https://docs.ankiweb.net/deck-options.html)) |
| 3 | New pattern family | ~15–30% | 3–5 new sentences that share one frame, each run through the ~90-second loop below | Repeating the anchor word boosts structural priming ([Mahowald et al. 2016](https://tedlab.mit.edu/tedlab_website/researchpapers/Mahowald_et_al_2016_JML.pdf)) |
| 4 | Compare | ~1–2 min | Taps what stays the same, then reads a one-line rule, then sees a one-change pair | Rule after comparison, d = 1.18 ([Alfieri et al. 2013](https://www.academia.edu/3708913/Learning_through_Case_Comparisons_A_Meta_Analytic_Review)) |
| 5 | First recalls | Inside steps 3–4 | Recalls each new sentence at ~1 minute and ~10 minutes | Successive relearning; [py-fsrs default learning steps](https://github.com/open-spaced-repetition/py-fsrs/blob/main/fsrs/scheduler.py) |
| 6 | Use it | ~1 min | Sees a new situation picture ("you want the bill") and says a sentence from today | Varied contexts ([Bolger et al. 2008](https://sites.pitt.edu/~perfetti/PDF/Context%20variation%20Bolger%20et%20al.pdf)) |
| 7 | Close | 30 s | Gets informational feedback ("You now recall 94% of 612 sentences"), the distance to the next checkpoint, and tomorrow's estimate | Verbal feedback raises intrinsic motivation, d = +0.33 ([Deci et al. 1999](https://home.ubalt.edu/tmitch/642/articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf)) |

Every new sentence goes through this ~90-second loop:

| Step | What happens | Evidence |
|---|---|---|
| a. Listen | Natural speed, text hidden. An optional slow version is always followed by natural speed. | "Slowed-down speech should always be followed by" normal-rate speech ([Anderson-Hsieh & Dauer 1997](https://files.eric.ed.gov/fulltext/ED413774.pdf)) |
| b. Guess | The learner taps a guess at the meaning before the reveal | Failed retrieval attempts that are followed by the answer help later learning ([Kornell, Hays & Bjork 2009](https://web.williams.edu/Psychology/Faculty/Kornell/Publications/Kornell.Hays.Bjork.2009.pdf)). Weak: verified by title only. |
| c. Reveal and notice | Text, gloss, literal L1 strip and image; the new chunk and any linked-speech spots are marked | Explicit instruction; words placed next to the picture, d = 1.10 ([Mayer & Fiorella](https://edtechuvic.ca/wp-content/uploads/sites/11/2022/09/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles.pdf)) |
| d. Shadow | 2–3 rounds (maximum 5) with a second voice | Shadowing improves fluency, prosody and comprehensibility, and plateaus at about five rounds ([Whitworth 2024](https://ora.ox.ac.uk/objects/uuid:3104cae1-3a6b-400a-b173-de44384238d2/files/r1z40kv86w)) |
| e. Say it | Record, get word-level feedback, retry the flagged words | Explicit ASR feedback g = 0.86 ([Ngo et al.](https://www.cambridge.org/core/journals/recall/article/effectiveness-of-automatic-speech-recognition-in-eslefl-pronunciation-a-metaanalysis/A915444CF252B61D14961D2FE733822D)) |
| f. Recall | Produce the sentence from the L1 prompt or image at ~1 minute and ~10 minutes | Successive relearning |

### Each sentence carries two memories and rotates exercise formats

The app keeps **two FSRS memory traces per sentence**: *comprehension* (ear and eye to meaning) and *production* (meaning to mouth or hand). A learner can recognize a sentence long before producing it, so separate traces avoid punishing listening reviews for speaking lag. Productive recall is unlocked only once the comprehension trace reaches about **7 days of stability**, which keeps first production attempts away from the ≤50%-success zone where retrieval without support stops helping. FSRS siblings are kept on different days, following Anki's ±5-day sibling spreading ([Anki load balancer](https://github.com/ankitects/anki/blob/main/rslib/src/scheduler/states/load_balancer.rs)). The design is the researchers' synthesis, with moderate support from general cognitive psychology.

| Trace | Exercise format (rotates between reviews) | German example | Grading |
|---|---|---|---|
| Comprehension | Audio → meaning (pick 1 of 3 translations or pictures) | Hear *Hast du heute Abend Zeit?* and pick "Are you free tonight?" | Automatic |
| Comprehension | Dictation (type what you hear) | Type *Hast du heute Abend Zeit?*; the diff shows where *hast du* ran together | Automatic token diff |
| Comprehension | Form-decides-meaning picture choice | *Den Lehrer fragt der Schüler.* Pick the picture where the **student** asks the teacher. | Automatic |
| Production | L1 or image → say it | "I'd like the bill." → *Ich hätte gern die Rechnung.* | Speech scoring |
| Production | L1 → type it | "I stayed home because I was tired." → *Ich bin zu Hause geblieben, weil ich müde war.* | Fuzzy text match |
| Production | Cloze on the new chunk | *Ich ___ gestern ins Kino gegangen.* → *bin* | Automatic |
| Production | Situation prompt | Café picture + "ask for the bill" → any sentence from the family is accepted | Speech scoring against the family's sentences |

Rotating formats adds noise to FSRS, because formats differ in difficulty (Inference). So formats within one trace should be of similar difficulty, and every review logs its format. That lets a later optimizer split parameter sets if needed.

### Grading turns answers into FSRS ratings without trusting the learner's confidence

FSRS can run on pass/fail input ([srs-benchmark two-button mode](https://github.com/open-spaced-repetition/srs-benchmark)). The app maps objective results to Again, Hard or Good; only the learner can tap Easy. The thresholds follow the researchers' recommendations and should be tuned per learner. The learner can override any automatic grade, because none of the speech engines has published agreement with human raters ([Azure transparency note](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/pronunciation-assessment/transparency-note-pronunciation-assessment)).

| Signal | Good | Hard | Again |
|---|---|---|---|
| Typed answer or dictation | Exact after normalization (*ae/oe/ue/ss* accepted for *ä/ö/ü/ß*) | One minor slip: capitalization, one letter, or a wrong article ending (logged as a "case" error) | A missing or wrong word, or ≥ 2 slips |
| Speaking, Azure Pronunciation Assessment | PronScore ≥ 80 and no Mispronunciation or Omission | 60–79, or one flagged word | Below 60, or any omission |
| Speaking, speech-recognition fallback | Word error 0 | 1 word | ≥ 2 words |
| Multiple choice | Correct on the first try | — | Wrong |
| Self-grade (only after the answer is revealed) | "Got it" | "Partly" | "Missed" |

Every lapse is tagged with an error type drawn from the answer diff: lexical, word order, case or agreement, mishearing, or spelling. Recurring error types become short targeted drills. Sentences that keep lapsing are flagged as "leeches" for rewriting or splitting (Inference; no controlled evidence exists on error logs).

### FSRS-6 is the scheduler; SM-2, fixed ladders and HLR are out

| Algorithm | Model | Benchmark log loss (lower is better) | Availability | Verdict |
|---|---|---|---|---|
| Fixed ladder (Clozemaster: 1/10/30/180 days; a wrong answer resets to 0) | Fixed intervals | Not benchmarked | — | Don't use |
| SM-2 (Anki legacy) | Ease multipliers, no probability model | FSRS-6 is better for **99.6%** of users ([Expertium](https://expertium.github.io/Benchmark.html)) | Public algorithm | Don't use |
| HLR (Duolingo 2016) | Half-life regression | **0.4694**, worse than the constant baseline's 0.3945 ([srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)) | Paper | Don't use |
| SM-17 | Difficulty-stability-retrievability model | FSRS-6 beat it on SuperMemo's own metric, 0.0287 vs. 0.0435, in a 19-user sample ([fsrs-vs-sm17](https://github.com/open-spaced-repetition/fsrs-vs-sm17)) | Proprietary | Not available |
| **FSRS-6** | Difficulty-stability-retrievability model, 21 parameters, trainable forgetting curve | **0.3460** | ts-fsrs and py-fsrs (MIT), fsrs-rs (BSD-3); what Anki runs today ([Anki Cargo.toml](https://github.com/ankitects/anki/blob/main/Cargo.toml)) | **Use** |
| FSRS-7 | 34 parameters, fractional intervals | 0.3370–0.3401 | In fsrs-rs `main`; default parameters conflict between two official sources; not in Anki | Upgrade later |
| RWKV neural network | 2.76M parameters | 0.2773 | Research only | Not practical for a solo developer |

**Settings for FSRS-6:**

| Setting | Value | Basis |
|---|---|---|
| Desired retention | **0.90** by default; a "Light" mode at 0.85; never above 0.95 | "Above 97% the workload can be overwhelming" ([Anki manual](https://docs.ankiweb.net/deck-options.html)) |
| Learning steps | 1 min, 10 min; never 1 day or longer | [py-fsrs defaults](https://github.com/open-spaced-repetition/py-fsrs/blob/main/fsrs/scheduler.py); Anki advises against day-long steps with FSRS |
| Relearning steps | 10 min | py-fsrs defaults |
| Fuzz | On (none below 2.5 days) | py-fsrs defaults |
| Parameters | Start from the defaults. Optimize per user and per trace after a few hundred to 1,000+ reviews, then roughly monthly. | Optimized beats default for **84.3%** of users ([Expertium](https://expertium.github.io/Benchmark.html)) |
| Load balancing | For intervals ≤ 90 days, pick the day within the fuzz range by weight (1/cards due)² × (1/interval) | Anki source ([load_balancer.rs](https://github.com/ankitects/anki/blob/main/rslib/src/scheduler/states/load_balancer.rs)). Anki's code is AGPL, so re-implement the idea; don't copy the code. |
| Review log | Timestamp, rating, elapsed days, answer duration, format, raw score, error tags | Needed to re-fit parameters and to upgrade to FSRS-7 later |

With the defaults at 0.90 retention, a sentence answered "Good" every time comes back after about **2, 11, 46, 163 and 497 days** (researchers' calculation from the [FSRS-6 formulas](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)).

### Workload math sets the pace: about 4.5 minutes a day for each new sentence a day

Anki's rule of thumb is that 20 new cards a day produce "roughly about 200 cards/day" of reviews ([Anki manual](https://docs.ankiweb.net/deck-options.html)). The researchers' FSRS-6 simulation agrees: about **10.1 reviews a day for each new card a day** at 0.90 retention. The figure rises steeply at higher targets.

| Desired retention | Reviews/day per new card/day | Mean recall of the collection at day 365 | Est. hours to finish 3,000 sentences |
|---|---|---|---|
| 0.80 | ≈ 7.3 | 0.90 | ≈ 185 |
| 0.85 | ≈ 8.5 | 0.93 | ≈ 200 |
| **0.90** | **≈ 10.1** | **0.95** | **≈ 225** |
| 0.95 | ≈ 13.5 | 0.97 | ≈ 280 |
| 0.97 | ≈ 18.5 | 0.98 | ≈ 350 |

The first three columns are the researchers' simulation. The hours column is our own arithmetic, which rests on three assumptions:

1. Each sentence has 2 traces.
2. A review takes about 9 seconds (the research gives 8–10 seconds as an assumption, not a measurement).
3. A new sentence's first loop takes about 1.5 minutes.

At 0.90 retention, then, each "new sentence per day" costs about 3 minutes a day of future reviews plus 1.5 minutes today: **≈ 4.5 minutes a day**. The total is therefore about 225 hours whatever the pace. The daily budget only sets the calendar:

| Daily budget | New sentences/day at steady state | Time to 3,000 sentences |
|---|---|---|
| 15 min | ~3 | ~2.5 years |
| 30 min | ~6–7 | ~15 months |
| 45 min | ~10 | ~10 months |
| 60 min | ~13 | ~7.5 months |

These are planning estimates. Load is lower than steady state in the early months, and speaking reviews probably take longer than 9 seconds. The planner therefore measures each learner's real seconds per format and sets new sentences per day from time, not from a fixed count:

> new sentences/day = (budget − forecast review minutes) ÷ minutes per new sentence

The review forecast comes from the simulator included in [fsrs-rs](https://github.com/open-spaced-repetition/fsrs-rs). Glossika reaches the same conclusion from practice: an ideal ratio of 10 reviews to 1 new item, with each new item turning into "15–20 reviews" over the next year (Company, [Glossika Help](https://help.glossika.com/en/articles/6611459-step-4-the-most-effective-way-to-train-on-glossika)).

### Backlog rules: pause new sentences, rescue the most-forgotten, never show the pile

| Situation | Rule | Basis |
|---|---|---|
| One missed day | Merge the missed load into today; the streak freeze covers it | A single missed day "did not materially disrupt" habit formation ([Lally et al. 2010](https://www.thebehavioralscientist.com/articles/how-long-to-form-a-habit)) |
| Overdue work exceeds one day's budget | Pause new sentences | Stop new cards "until you catch up" ([Anki manual](https://docs.ankiweb.net/deck-options.html)); Glossika stops new content when reviews are missed more than once a week (Company) |
| Recovery mode | Order reviews by lowest predicted recall first; cap each day at 1.5× the budget; spread the rest with a Postpone/Flatten-style cost function; show "back on track by [date]" | Anki and FSRS practice ([FSRS Helper](https://github.com/open-spaced-repetition/fsrs4anki-helper/blob/main/README.md)); FSRS already handles late answers because stability "converges to an upper limit" ([FSRS wiki](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)) |
| After recovery | Ramp new sentences back up: 25% → 50% → 75% → 100% over a week | Inference |
| Known vacation | Offer pause, lighter days, or pulling reviews forward | Anki Easy Days; FSRS Helper "Advance" |
| Display | Never show "847 due"; show "Today · 18 min" | Inference |

## 6. Listening and speaking: train the ear with many voices before scoring the mouth

The evidence for pronunciation work is unusually strong:

- **Explicit instruction works.** Effects were d = 0.89 within groups and 0.80 between groups across 86 reports, larger with feedback and with longer training ([Lee, Jang & Plonsky 2015](https://academic.oup.com/applij/article/36/3/345/2422438)).
- **Perception training works and lasts.** High-variability training on the target sounds showed improvement in 97% of 32 studies, generalized to new talkers in every study that tested it, and held up to 4 months ([Thomson 2018](https://languagelog.ldc.upenn.edu/myl/2018Thomson_HVPT.pdf)).
- **Bottom-up listening drills help.** In 53 A2 learners, activities such as short transcriptions raised dictation scores by 10.44 points vs. 2.33 for controls ([Siegel & Siegel 2015](https://files.eric.ed.gov/fulltext/EJ1135116.pdf)).
- **Automatic speech feedback helps, given time.** ASR feedback gives g = 0.69 overall. It works best when explicit (0.86 vs. 0.50) and on individual sounds (0.82 vs. 0.37 for prosody), and it is negligible over 1–4 weeks (0.07) but large over 5–8 weeks (1.01) ([Ngo, Chen & Lai](https://www.cambridge.org/core/journals/recall/article/effectiveness-of-automatic-speech-recognition-in-eslefl-pronunciation-a-metaanalysis/A915444CF252B61D14961D2FE733822D)).
- **Understandable beats native-like.** "A strong foreign accent does not necessarily reduce the comprehensibility or intelligibility of L2 speech" ([Munro & Derwing 1995](https://eric.ed.gov/?id=EJ519945)). The app therefore scores understandability, never "native-likeness."

| Feature | Specification | Evidence |
|---|---|---|
| Multi-voice audio | 2 voices in the MVP, 4 later, rotated across reviews | Six encounters with talker variability gave the best spoken-word results ([Uchihara et al. 2022](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/effects-of-talker-variability-and-frequency-of-exposure-on-the-acquisition-of-spoken-word-knowledge/BE3F063E0BAC9A4F16726400A3877F31)). Caution: the immediate multi-voice advantage "nearly disappeared" after bias correction ([Zhang et al. 2021](https://pubs.asha.org/doi/abs/10.1044/2021_JSLHR-21-00181)). |
| Slow → natural | Generate slow audio with real TTS rate control, never by time-stretching playback. Always follow with natural speed, and drop the slow version once comprehension matures. | Anderson-Hsieh & Dauer 1997 |
| Dictation with diff | Type what you hear; the diff highlights linked and reduced forms | Siegel & Siegel 2015; connected speech caused 640 classified errors even in advanced learners ([System 2021](https://www.sciencedirect.com/science/article/abs/pii/S0346251X21000348)) |
| Minimal-pair perception drills | Identification with feedback, many voices, picked for the learner's L1 | Studies used 3–13.5 hours of training in total; identification tasks beat discrimination tasks ([Thomson 2018](https://languagelog.ldc.upenn.edu/myl/2018Thomson_HVPT.pdf)) |
| Shadowing | 2–5 rounds, only after the meaning is known; scripted first, then audio-only | Plateau at about five rounds; the effect on individual sounds is "inconclusive" ([Whitworth 2024](https://ora.ox.ac.uk/objects/uuid:3104cae1-3a6b-400a-b173-de44384238d2/files/r1z40kv86w)) |
| Record and compare | Word-level explicit feedback, then retry the flagged words; copy promises results over 5+ weeks | Ngo et al. |
| Pitch/waveform view (later) | Optional overlay with a one-time tutorial; a length bar for vowel-length pairs | Small studies: [Hardison 2004](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/5458ce95-b4cf-4745-9db9-687396072ec0/content); [Okuno & Hardison 2016](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/1aa3007d-263b-4287-858f-e1674c272824/content); learners need training to read the displays ([Chun 1998](https://scholarspace.manoa.hawaii.edu/bitstreams/1404eb39-4d4e-417c-8788-0a7480e3b2f7/download)) |
| Short dialogues (later) | 2–4-line exchanges for intonation across sentences | Isolated sentences suppress discourse-level intonation ([Levis & Pickering 2004](https://www.sciencedirect.com/science/article/abs/pii/S0346251X04000752)) |

**Where an Arabic-speaking learner's L1 matters.** The app stores the learner's L1 so it can choose perception drills that fit it. For an Arabic speaker learning German, standard contrastive phonology suggests these starting pairs:

- *Pass–Bass* (/p/ vs. /b/)
- *fein–Wein* (/f/ vs. /v/)
- *Tür–Tier* and *schön–schon* (the rounded front vowels ü and ö)
- *Staat–Stadt* (vowel length)

German *ach* uses the same sound as Arabic خ, so that one transfers positively. These pairs are illustrative. A phonetics-aware reviewer should confirm them; the research did not test Arabic–German pairs.

**Text-to-speech options** (per-language cost: 3,000 sentences × ~60 characters × 4 voices plus a slow version ≈ 0.9M characters, researchers' arithmetic):

| Option | Price per 1M chars | Languages | Licence / caching note | Role |
|---|---|---|---|---|
| Azure Neural | ~$15–16 (third-party figures; the official page showed placeholders) ([TextToLab](https://texttolab.com/blog/azure-text-to-speech-pricing)) | 100+ languages/locales; SSML rate control ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech)) | Free tier 0.5M chars/month; storage terms not verified | **Primary** (same vendor as pronunciation scoring); ≈ $15/language |
| Amazon Polly Neural | $16 ([AWS](https://aws.amazon.com/polly/pricing/)) | Not fetched | "Cache and replay … at no additional cost" | Primary alternative; ≈ $15/language |
| Google WaveNet / Chirp 3 HD | $4 / $30 ([Google](https://cloud.google.com/text-to-speech/pricing)) | Chirp: 50 locales, rate 0.25–2× ([docs](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd)) | Storage terms not verified | Budget / premium; Chirp ≈ $27/language |
| ElevenLabs v3 | $100 (Flash: $50) ([pricing](https://elevenlabs.io/pricing/api)) | 70+ | Free plan has no commercial licence | Premium; ≈ $90/language |
| OpenAI tts-1 | $15 ([CostGoat](https://costgoat.com/pricing/openai-tts)) | ~50+, optimized for English | Must disclose the AI voice ([OpenAI](https://developers.openai.com/api/docs/guides/text-to-speech)) | Not for German-first |
| Kokoro-82M | Free, Apache-2.0 | 8–9 languages, **no German** ([model card](https://huggingface.co/hexgrad/Kokoro-82M)) | — | English only |
| Piper | Free, GPL-3.0 | 42 languages, including German and Dutch ([piper1-gpl](https://github.com/OHF-Voice/piper1-gpl)) | Per-voice licences; "personal use and TTS research only" | Prototyping |
| XTTS-v2 | — | 17 | Non-commercial licence, and no one left to buy a commercial licence from ([D-Central](https://d-central.tech/local-voice-ai-models/)) | Avoid |
| Browser `speechSynthesis` | Free | Depends on the device | Cannot export audio ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)) | Offline fallback |
| Human audio: Tatoeba | Free | 32,938 German sentences with audio | Per-file licence; if the licence field is empty, the audio can't be reused ([downloads](https://tatoeba.org/en/downloads)) | Prefer where licensed |

**Pronunciation scoring options:**

| Engine | Relevant languages | What it returns | Cost | Caveat |
|---|---|---|---|---|
| **Azure Pronunciation Assessment** | 33 locales, including **de-DE, nl-NL, ar-EG** ([list](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/includes/language-support/pronunciation-assessment.md)) | Accuracy, fluency and completeness scores; word errors (Omission, Insertion, Mispronunciation); prosody for en-US only ([how-to](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)) | ~$1.32 per audio-hour ([Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat)) ≈ **$0.0015 per 4-second attempt**; 5 free hours/month ([Azure pricing](https://azure.microsoft.com/en-us/pricing/details/speech/)) | Scores measure "similarity distance to the native speakers" in its training data; no published human-rater correlation |
| SpeechSuper | 8 languages, including German | Phoneme-to-sentence scores, fluency, rhythm, stress | $0.006 per sentence; $20/month minimum ([pricing](https://www.speechsuper.com/pricing.html)) | No Dutch or Arabic |
| Speechace / ELSA | English, French, Spanish / English only | Rich English feedback | From $40/month / $0.008 per 15 s ([Speechace](https://www.speechace.com/api-plans/); [ELSA](https://elsaspeak.com/en/elsa-api/)) | No German |
| Speech-recognition diff (Whisper or gpt-4o-mini-transcribe) | ~99 languages | Transcript vs. target, word error count | $0.003/min hosted ([OpenAI](https://developers.openai.com/api/docs/pricing)); MIT if self-hosted | An intelligibility check only, with no phoneme diagnosis |
| Web Speech API | Chrome/Safari | Transcript + confidence | Free | Sends audio to a server by default; Firefox only behind a flag ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)) |
| Open-source GOP (wav2vec2) | Multilingual | Phoneme "goodness" scores | Free | Correlation with human ratings only r ≈ 0.44 ([arXiv 2506.12067](https://arxiv.org/html/2506.12067)) |

At 1,000 attempts per active user per month, Azure costs about **$1.50 per user per month**, against $6–8 for SpeechSuper, Speechace or ELSA (researchers' arithmetic). Azure's free 5 hours covers about 4,500 four-second attempts a month, which is enough for the developer's own testing.

**Privacy.** Voice recordings are personal data. EU guidance says voice data should be kept "no longer than is necessary." It also says users "should be able to separately consent or not" to human review, and that voice becomes biometric data only when it is processed to identify a person ([EDPB Guidelines 02/2021](https://www.edpb.europa.eu/system/files/2021-03/edpb_guidelines_022021_virtual_voice_assistants_adopted-public-consultation_en.pdf)). The defaults follow from that:

- Delete audio right after scoring and keep only scores and word errors.
- Offer opt-in retention for learners who want to compare their recordings over time.
- Require separate consent before any recording is used for model training.
- Never do voiceprinting.
- Tell users which vendor receives their audio.

## 7. Images anchor situations, video waits for intermediate learners, and licences dictate caching

Images are the most misused tool in language apps. For L2 words, pictures did not beat translations. Learners *believed* they did, and pictures helped only once that overconfidence was countered with retrieval practice or warnings ([Carpenter & Olson 2012](https://eric.ed.gov/?id=EJ965468)). A 2023 study found translation pairs were remembered *better* than picture pairs ([PLOS One 2023](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0286824)).

Relevant images placed well do help. Cutting extraneous material gave a median d = 0.86, and placing words next to the matching picture gave d = 1.10 ([Mayer & Fiorella](https://edtechuvic.ca/wp-content/uploads/sites/11/2022/09/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles.pdf)). One 2026 study found AI-generated images beat text-only instruction for concrete nouns (48-hour recall 0.75 vs. 0.45, d = 0.82). The authors note they cannot credit the benefit to the images being AI-generated, since the study had no ordinary-image condition ([PLOS One 2026](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0334778)).

Video helps later rather than sooner. Captioned video boosts L2 listening (g = 0.99) and vocabulary (g = 0.87) ([Montero Perez et al. 2013](https://www.academia.edu/100980682/Captioned_video_for_L2_listening_and_vocabulary_learning_A_meta_analysis)). The gains are much larger for **intermediate learners (g = 0.81) than for beginners (0.28)**, and for learner-targeted videos (1.04) than for authentic native material (0.46) ([Kurokawa et al. 2025 preprint](https://takumiuchihara.weebly.com/uploads/1/2/3/7/123756989/kurokawa_et_al.__2024_.pdf)).

These findings translate into five media rules (Inference, drawn from the evidence above):

1. **The image shows the situation; the gloss carries the meaning.** Both are always on screen.
2. **Images only for depictable sentences.** Use them for sentences like *Sie schenkt Kaffee ein*. Abstract sentences like *Das bezweifle ich* get a dialogue frame instead, because concrete material is what activates imagery ([Clark & Paivio 1991](https://nschwartz.yourweb.csuchico.edu/Clark%20&%20Paivio.pdf)).
3. **No decorative stock "mood" photos.**
4. **Every image exposure ends in retrieval** ("say the sentence for this picture").
5. **Authentic clips are gated.** They unlock only for sentences whose memories are mature, and only from Band 3 onward. They are always captioned in the target language and trimmed to the sentence.

**"Use it in situations" mode** is where the app turns sentences into behaviour. A scene (a café counter, a ticket machine, a doctor's desk) comes with an L1 or picture prompt such as "You want the bill; ask politely," and the learner says a fitting sentence from any family learned so far. Over time each pattern appears in at least three different scenes with different voices. This follows the contextual-variability evidence, which found varied contexts mainly build abstract, transferable meaning ([Bolger et al. 2008](https://sites.pitt.edu/~perfetti/PDF/Context%20variation%20Bolger%20et%20al.pdf)). Adults benefit from multiple speakers; children aged 7–11 did not ([Sinkeviciute et al. 2019](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/role-of-input-variability-and-learner-age-in-second-language-vocabulary-learning/ED362690152E237EA404402CFA5D985E)).

| Source | Can the app store it? | Obligations | Fit |
|---|---|---|---|
| AI image generation | Yes (your own output) | None legally required; purely AI output is not copyrightable in the US ([USCO report](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf)) | Best for sentence-specific scenes; $0.005–0.05 per image at low/medium quality ([CostGoat](https://costgoat.com/pricing/openai-images)); forbid rendered text, which generators garble ([Pyae](https://www.arxiv.org/pdf/2411.15710)) |
| Pixabay | **Must** download and self-host; no permanent hotlinking; cache API results for 24 h ([API docs](https://pixabay.com/api/docs/)) | Show the source in search results | Good stock backbone; search in 26 languages, including German |
| Pexels | Individual use is fine; no caching "as a substitute for the API" ([API docs](https://www.pexels.com/api/documentation/)) | A prominent Pexels link | Supplementary |
| Unsplash | **No**, must hotlink the API URLs ([guideline](https://help.unsplash.com/en/articles/2511271-guideline-hotlinking-images)) | Photographer + Unsplash credit with UTM links ([guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)) | Awkward for offline and mobile use |
| Wikimedia Commons | Yes, per file licence ([reuse](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/technical)) | Attribution, often CC BY-SA | Diagrams, places |
| Openverse | Depends on each work's licence | "Always verify the license" ([docs](https://docs.openverse.org/api/reference/made_with_ov.html)) | Discovery only |
| YouTube embed | **No** audio or video caching; metadata ≤ 30 days ([policies](https://developers.google.com/youtube/terms/developer-policies)) | Unmodified player ≥ 200×200 px; `start`/`end` and caption parameters are allowed ([player parameters](https://developers.google.com/youtube/player_parameters)) | Clip segments |
| YouGlish | No (built on YouTube) | "Powered by YouGlish.com" always visible; **commercial or mobile use needs explicit permission** ([JS API](https://youglish.com/api/doc/js-api)) | ~24 languages, including German, Dutch and Arabic; REST API €25/month (500 requests/day) or €300/month ([plans](https://youglish.com/api/plans)) |

Because images are language-neutral, the data model attaches them to a **meaning ID** rather than to a German sentence. One scene then serves every future language. At $0.005–0.05 per image, 3,000 scenes cost roughly **$15–150 per style pass**, once (researchers' arithmetic). Every generated image still needs human review for errors and bias.

## 8. The compare engine: block to see the frame, prompt the comparison, state the rule, then mix

The "always compare and clarify" requirement has some of the best-specified evidence in the whole blueprint:

- **Comparing cases works, especially when guided.** Comparison gives d = 0.50 across 57 experiments. Stating the principle *after* the comparison gave **d = 1.18**, and comparing to find similarities gave d = 0.68, while hunting only for differences gave **d = −0.19** ([Alfieri et al. 2013](https://www.academia.edu/3708913/Learning_through_Case_Comparisons_A_Meta_Analytic_Review)).
- **Learners rarely compare unless prompted.** Only 16% of learners who studied cases separately linked them, vs. 98% who were asked to compare. Transfer rose from 19% to 48% ([Gentner, Loewenstein & Thompson 2003](https://groups.psych.northwestern.edu/gentner/papers/GentnerLoewensteinThompson03.pdf)).
- **Contrast prepares learners for telling.** Contrasting cases analyzed *before* an explanation made the explanation work better ([Schwartz & Bransford 1998](http://aaalab.stanford.edu/assets/papers/earlier/A_time_for_telling.pdf)).
- **Repeating the anchor word makes a frame stand out.** Structural priming is robust (odds ratio 1.67) and roughly doubles when the verb repeats (3.26), especially in a second language ([Mahowald et al. 2016](https://tedlab.mit.edu/tedlab_website/researchpapers/Mahowald_et_al_2016_JML.pdf)). That lexical boost is short-lived, though, while the abstract frame persists ([Jackson 2018](https://journals.sagepub.com/doi/abs/10.1177/0267658317746207)).

| Step | Screen | German example | Evidence |
|---|---|---|---|
| 1. Family | 3–5 sentences with the same frame and anchor | *Ich hätte gern einen Kaffee.* · *Ich hätte gern ein Wasser.* · *Ich hätte gern die Rechnung.* | Priming lexical boost |
| 2. Prompted similarity | "Tap the part that stays the same" | Learner taps *Ich hätte gern* | Prompting is needed (16% vs. 98%) |
| 3. Rule after | One line | "*Ich hätte gern* + thing = the polite 'I'd like'" | d = 1.18 |
| 4. One-change pair | Only the changed slot is highlighted | *Ich möchte einen Kaffee.* vs. *Ich möchte einen Kaffee **trinken**.* The second verb goes to the end. | Contrasting cases; differences only after similarities |
| 5. Interleave | Later reviews mix confusable families | *Ich **habe** Pizza **gegessen**.* vs. *Ich **bin** nach Hause **gegangen**.* | Delayed benefit d = 0.64 ([Nakata & Suzuki 2019](https://www.academia.edu/40127030/Nakata_T_and_Suzuki_Y_2019_Mixing_grammar_exercises_facilitates_long_term_retention_Effects_of_blocking_interleaving_and_increasing_practice_Modern_Language_Journal_103_629_647)) |

**When to group and when to mix:**

| Situation | Group or mix? | Why |
|---|---|---|
| First exposure to a new frame | Group 3–5 sentences in one session | Blocking helps learners work out what verbal, rule-based categories have in common ([Sorensen & Woltz 2016](https://link.springer.com/article/10.3758/s13421-016-0615-x)) |
| Confusable grammar (*haben/sein*, *weil/denn*, *der/den*, *Heute gehe ich* vs. *Ich gehe heute*) | Mix in reviews from the next session on | Interleaving pays off most when categories are similar; d = 0.64 for tenses, larger for weaker learners |
| Plain vocabulary items | Don't force mixing; let the scheduler's order handle it | Word materials showed a blocking advantage, g = −0.39 ([Brunmair & Richter 2019](https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf)) |
| Semantic sets (colours, weekdays) | Open question; spread them across families by default | The relevant L2 study could not be verified |
| Unrelated patterns | No deliberate mixing | The benefit comes from similarity between categories |

**L1/L2 alignment strip.** Explicit instruction about the L1, added to L2 instruction, improved oral accuracy immediately and still 6 weeks later ([McManus & Marsden 2019](https://eric.ed.gov/?id=EJ1215578)). That is a single study with 69 learners and one structure, but it is direct support. The strip aligns a literal gloss under the German sentence and marks what has no counterpart or what moves. For this learner, both glosses are useful: Arabic shows where German adds or moves pieces, and English (C1) exposes cognates and near-identical structure. The Arabic examples below are illustrative and need native review.

| German | *Ich **bin** müde.* | *Ich hätte gern **einen** Kaffee.* | *…, weil ich müde **bin**.* |
|---|---|---|---|
| Egyptian Arabic | أنا تعبان (literally "I tired") | عايز قهوة (literally "want coffee") | عشان أنا تعبان |
| What the strip marks | *bin* has no present-tense Arabic counterpart | *einen* carries gender and case; Arabic has no separate indefinite-article word | The verb jumps to the end after *weil* |
| English strip | I **am** tired | I would like **a** coffee | because I **am** tired |

**Highlighting and "form decides meaning" tasks.** Visual highlighting alone has a modest effect on grammar (d = 0.22) and can *reduce* comprehension (d = −0.26) ([Lee & Huang 2008](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/visual-input-enhancement-and-grammar-learning-a-metaanalytic-review/B9D0C50B09928C20C94548B37B29A042)). Stacking several highlighting techniques adds nothing ([Rassaei & Jabbarpoor 2025](https://www.degruyterbrill.com/document/doi/10.1515/iral-2025-0118/html)). So the app colours **only the changing slot**, keeps one colour for that slot across a family, and keeps a meaning question in every item.

Structured-input tasks do more for comprehension ([Shintani 2015](https://eric.ed.gov/?id=EJ1067991)) and target the habit of reading the first noun as the doer ([processing-instruction overview](https://ttu-ir.tdl.org/bitstreams/aab15a9c-8cf0-40c7-81c4-e45bd5e6c104/download)). German's case system makes a clean version: *Den Lehrer fragt der Schüler.* comes with two pictures that differ only in who asks whom, so only the *den/der* endings decide the answer.

Finally, "clarify tasks" means every exercise screen shows a one-line instruction and a one-line reason ("Type what you hear. This trains your ear for words that run together"). The reason collapses after the first few uses. This is a design inference from the signaling principle (d = 0.41), which is strongest for low-knowledge learners and weakens with overuse ([Mayer & Fiorella](https://edtechuvic.ca/wp-content/uploads/sites/11/2022/09/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles.pdf)).

## 9. Consistency comes from a small daily minimum, forgiving streaks and rewarded comebacks

Habits take longer than the popular "21 days." Across 20 studies, the median to automaticity was **59–66 days**, with individual cases ranging from 4 to 335 days ([Singh et al. 2024](https://www.mdpi.com/2227-9032/12/23/2488)). One missed day does not reset the process ([Lally et al. 2010](https://www.thebehavioralscientist.com/articles/how-long-to-form-a-habit)).

What sustains the habit is also not what apps usually push:

- **Event cues beat reminders.** Reminders "supported repetition but hindered habit development," while cues tied to events built automaticity ([Stawarz et al. 2015](https://discovery.ucl.ac.uk/1468224/)).
- **Flexible timing beats a rigid slot.** Flexible exercise timing produced more durable habits than a fixed window ([Beshears et al. 2021](https://www.library.hbs.edu/working-knowledge/unexpected-exercise-advice-for-the-super-busy-ditch-the-rigid-routine)).
- **Frequency matters more than length.** In a small study, days per week correlated with intrinsic motivation (ρ = 0.48) and session length did not ([2026 study](https://link.springer.com/article/10.1186/s40862-026-00443-3)).
- **Gamification helps learning modestly.** It improves cognitive outcomes (g = 0.49), and that effect holds in rigorous studies ([Sailer & Homner 2020](https://eric.ed.gov/?id=EJ1245270)).
- **Leaderboards can backfire.** In a 16-week course, leaderboards and badges *lowered* intrinsic motivation and final exam scores ([Hanus & Fox 2015](https://www.sciencedirect.com/science/article/abs/pii/S0360131514002000)).

| Mechanic | Specification | Evidence | Mainly serves |
|---|---|---|---|
| Minimum viable day | The streak counts 5 minutes or today's due reviews up to the cap, whichever comes first | Company: decoupling the streak from the XP goal gave +3.3% day-14 retention, but "fewer learners were actually reaching their daily goals" ([Duolingo](https://blog.duolingo.com/improving-the-streak)) | Showing up |
| Cue plan at onboarding | A 30-second if-then plan: "When [cue], I do today's session" | d = 0.65 ([Gollwitzer & Sheeran 2006](https://www.researchgate.net/publication/37367696_Implementation_Intentions_and_Goal_Achievement_A_Meta-Analysis_of_Effects_and_Processes)). At scale the effects were "an order of magnitude smaller" ([Kizilcec et al. 2020](https://news.cornell.edu/stories/2020/06/study-no-single-solution-helps-all-students-complete-moocs)), and a planning exercise helped only learners from individualist countries ([Kizilcec et al. 2017](https://rene.kizilcec.com/wp-content/uploads/2017/05/kizilcec2017mcii.pdf)), so test it locally. | Habit |
| Reminders | Sent ~23.5 h after the last session; at most 1–2 a day; rotating copy; one evening "last chance" | Company ([Duolingo PM transcript](https://github.com/ChatPRD/lennys-podcast-transcripts/blob/main/episodes/jackson-shuttleworth/transcript.md)); a push made engagement within 24 h 3.9% more likely ([Bidargaddi et al. 2018](https://researchnow-admin.flinders.edu.au/ws/portalfiles/portal/31737554/document_2_.pdf)) | Showing up |
| Streak freezes | **2** free at the start of a streak; no paid repair; "earn back" with an extra session within 48–72 h | Company: 2 freezes beat 1, a third added nothing, and Earn Back was a big win (transcript). A repairable break demotivates less ([Silverman & Barasch 2023](https://academic.oup.com/jcr/article-abstract/49/6/1095/6623414)). A limited, costly reserve raises persistence ([Sharif & Shu](https://journals.sagepub.com/doi/10.1509/jmr.15.0231)). | Showing up |
| Comeback reward | The first session after a gap is a short recovery session plus recognition | Rewarding a return after a miss was the **top intervention** in a 61,293-person megastudy ([Milkman et al. 2021](https://www.nature.com/articles/s41586-021-04128-4)) | Re-entry |
| Fresh-start reset | Messages on Mondays, the 1st of the month and New Year, with an automatically rebuilt plan | Gym visits rose 33.4% at the start of a week ([Dai, Milkman & Riis 2014](https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf)) | Re-entry |
| Roadmap with a head start | Onboarding counts as the first milestone; the next target appears right after each celebration | A pre-stamped card was completed in 12.7 vs. 15.6 days ([Kivetz et al. 2006](https://home.uchicago.edu/ourminsky/Goal-Gradient_Illusionary_Goal_Progress.pdf)) | Motivation |
| Progress in learning units | Sentences mastered, true retention, days per week, forecast finish *range* from the 14-day pace | Monitoring progress improves goal attainment, d = 0.40, more so when recorded or shared ([Harkin et al. 2016](https://eprints.whiterose.ac.uk/id/eprint/87431/)) | Learning |
| Monday review | Last week's summary plus one auto-proposed change ("Keep 8 new per day?") | Inference from Harkin and from [Locke & Latham 2002](https://med.stanford.edu/content/dam/sm/s-spire/documents/PD.locke-and-latham-retrospective_Paper.pdf) | Autonomy |
| Informational praise | "You now recall 94% of 612 sentences"; no coins for completing sessions | Tangible rewards reduced intrinsic motivation (d = −0.34); verbal feedback raised it (+0.33) ([Deci et al. 1999](https://home.ubalt.edu/tmitch/642/articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf)) | Motivation |
| Optional study buddy | Share weekly progress; no global XP leaderboard by default | Company: a friend streak made learners 22% more likely to complete the daily lesson ([Duolingo](https://blog.duolingo.com/product-lessons-friend-streak/)); competition plus collaboration worked best (Sailer & Homner) | Relatedness |
| North-star metric | Reviews completed at target retention + new sentences mastered, never raw sessions | Duolingo dropped session counts because they "favored easier, shorter activities" ([Time Spent Learning Well](https://blog.duolingo.com/time-spent-learning-well)) | Product integrity |

Two warnings frame this section. First, most nudges fade: only **8%** of the megastudy's interventions still had effects after the four weeks ended ([Milkman et al. 2021](https://www.nature.com/articles/s41586-021-04128-4)). The mechanics must therefore stay on permanently, not run as an onboarding campaign. Second, the strongest dropout reducer in MOOC data was making **the content itself more approachable**, while ad-hoc email nudges did not help ([Computers & Education](https://www.sciencedirect.com/science/article/abs/pii/S036013152100289X)). For this app, that makes the pacer and the one-new-item rule the most important retention features.

## 10. A solo-developer architecture: offline content factory, thin API, append-only review log

The hard problems sit in the backend: building content and computing workload. That suits a backend-oriented builder. The stack suggestions here are Inference, apart from the FSRS libraries and services cited.

| Component | Responsibility | Suggested implementation |
|---|---|---|
| Content factory (offline) | Pipeline steps 1–8; outputs a versioned content pack per language | Python, spaCy/Stanza, LLM API, batch TTS, a simple web form for native reviewers |
| Content store | Sentences, patterns, glosses, media metadata, licences | Postgres; object storage + CDN for audio and images |
| API | Auth, content delivery, review ingestion, daily plan generation | Python (e.g., FastAPI) |
| Scheduler | FSRS-6 state per trace | [py-fsrs](https://github.com/open-spaced-repetition/py-fsrs) (MIT) on the server for the MVP; [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) (MIT) on the client later for offline use |
| Planner | Budget → session; recovery mode; load balancing | Own code, re-implementing Anki's ideas (not its AGPL code) |
| Optimizer job | Per-user, per-trace parameter fitting, monthly | [fsrs-rs](https://github.com/open-spaced-repetition/fsrs-rs) (BSD-3, includes an optimizer and simulator) or its TS/WASM binding |
| Speech service | Proxies to Azure; returns scores and word errors; deletes audio | Azure Speech REST/SDK |
| Client | Session UI, playback, recording, images | Web PWA for the MVP |
| Analytics | True retention, pace, forecasts, checkpoint results | SQL over the review log |

A data model sketch follows. The review log is append-only and is the source of truth: FSRS state can always be rebuilt from it.

```text
language(id, code)
lemma(id, language_id, lemma, freq_rank, cefr_hint)
meaning(id, concept_label, depictable, image_media_id)          -- shared across languages
pattern(id, language_id, frame_text, band, grammar_tag)
pattern_contrast(pattern_a_id, pattern_b_id, contrast_type, note) -- e.g. haben vs sein
sentence(id, language_id, text, tokens[], lemma_ids[], new_item_id, pattern_id, meaning_id,
         band, cefr, theme, order_index, source, license, attribution, review_status)
gloss(sentence_id, gloss_lang, natural_text, literal_text, alignment_json, rule_note)
media(id, kind[audio|image|clip], uri, voice_id, speed, license, attribution, expires_at)
app_user(id, l1, gloss_langs[], target_lang, daily_minutes, desired_retention, cue_text)
trace(id, user_id, sentence_id, kind[comprehension|production], stability, difficulty,
      state, due_at, last_review_at, params_id)
review_log(id, trace_id, reviewed_at, rating, elapsed_days, duration_ms, format,
           raw_score, error_tags[])                              -- append-only
fsrs_params(id, user_id, trace_kind, model_version, weights[], n_reviews, fitted_at)
pron_attempt(id, user_id, sentence_id, engine, pron_score, word_errors_json, created_at)
daily_plan(user_id, plan_date, budget_min, mode[normal|recovery], review_trace_ids[], new_sentence_ids[])
checkpoint_result(user_id, checkpoint, retention, listening_pct, speaking_pct, passed_at)
```

| Cost item | One-time, per language | Recurring | Basis |
|---|---|---|---|
| Neural TTS, 4 voices + slow (~0.9M chars) | ≈ $15 (Azure/Polly), ≈ $27 (Chirp 3 HD), ≈ $90 (ElevenLabs) | Storage and CDN only | Provider prices × researchers' arithmetic |
| 3,000 AI scene images (shared across languages) | ≈ $15–150 per style pass | — | [CostGoat](https://costgoat.com/pricing/openai-images) |
| Speaking assessment | — | ≈ $1.50 per active user per month at 1,000 attempts (Azure); 5 free hours/month | [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat) |
| ASR fallback | — | $0.003 per minute | [OpenAI](https://developers.openai.com/api/docs/pricing) |
| YouGlish REST (optional) | — | €25 or €300 per month | [YouGlish plans](https://youglish.com/api/plans) |
| FSRS libraries, Tatoeba, Common Voice | Free | Attribution | Licence pages |
| LLM generation and QC, hosting, native reviewers | **Not priced in this research** | — | Native review is likely the largest real cost |

Build the content factory and scheduler first and the screens last. The project's risk sits in sentence quality and workload math, not in the UI.

## 11. The MVP ships German bands 1–2; everything else is a later version

| Area | MVP (v1) | v2 | v3+ |
|---|---|---|---|
| Languages | German, with English + Arabic glosses | Dutch (Azure scores nl-NL; Tatoeba has 201,265 Dutch sentences) | Any language via the pipeline; Arabic as a target, after the dialect decision |
| Content | Bands 1–2 (~1,000 sentences), all native-reviewed | Bands 3–4 (to 3,000) | Contributions from teachers |
| Scheduling | FSRS-6 defaults, 0.90 retention, two traces | Per-user optimization; pacer driven by the simulator | FSRS-7 upgrade |
| Planner | Minutes budget, backlog/recovery rules, load balancing | Vacation mode, light days | Learned session-time estimates |
| Listening | 2 TTS voices + slow version; dictation | 4 voices; licensed human audio; minimal-pair drills tuned to the L1 | Dialogues for intonation |
| Speaking | Azure de-DE scoring with word-level feedback; shadowing | Mini-drills by error type | Pitch/waveform view; open-source scoring for unsupported languages |
| Images | Scene images for concrete sentences only | 3+ situations per pattern | — |
| Video | None | Captioned YouTube segments for mature sentences, licence permitting | Own clip index |
| Compare engine | Families, "what's the same?" tap, rule after, one-change pair, L1 strip | Interleaved contrast drills; form-decides-meaning picture tasks | Contrasts generated from the error log |
| Consistency | One button, streak with 2 freezes, comeback session, roadmap and checkpoints | Monday review, study buddy, fresh-start messages | Optimized notification timing and copy |
| Platform | Web PWA, online only | Offline support, mobile | — |

The MVP needs a success test beyond "it works" (Inference). After at least 8 weeks of real use, three things should hold:

1. Measured true retention sits within a few points of the 90% target.
2. Sessions finish within budget on at least 90% of days.
3. The 1,000-sentence checkpoint is passed.

The 8-week horizon matters because ASR feedback studies show almost no effect before week 5 ([Ngo et al.](https://www.cambridge.org/core/journals/recall/article/effectiveness-of-automatic-speech-recognition-in-eslefl-pronunciation-a-metaanalysis/A915444CF252B61D14961D2FE733822D)).

## 12. Where the research contradicts common app practice, and where it simply runs out

| Common practice | What the research says | Blueprint choice |
|---|---|---|
| "Learn the most common sentences" from raw frequency | The top 3,000 are 2.3-word interjections covering 13.5% of occurrences | Rank lemmas and chunks; curate the sentences |
| Pictures instead of translations | No advantage, and inflated confidence ([Carpenter & Olson](https://eric.ed.gov/?id=EJ965468)) | Gloss + image + retrieval |
| Drilling a new item many times in one sitting (e.g., 5 reps × 5 new sentences) | 68% vs. 26% in favour of spaced single recalls; one retrieval is the most efficient per minute | 1–2 recalls the same day, then spacing |
| Fixed interval ladders; a wrong answer resets progress to zero | Adaptive FSRS-6 predicts memory far better; HLR is below a constant baseline | FSRS-6 |
| Self-rated buttons for everything | Judgments of learning give no benefit; overconfidence hurts learning | Objective grading; reveal, then rate |
| Grammar rule first | Principle after comparison: d = 1.18 vs. 0.37 before | Rule after comparison |
| Colour-coding every part of speech | Combining techniques adds nothing; highlighting can cut comprehension (d = −0.26) | Highlight one slot + a meaning task |
| XP leaderboards and badges for everyone | Lower motivation and exam scores in one course; Duolingo dropped session counts | Optional buddy; learning-weighted metric |
| Fixed daily reminder time | Reminders hinder automaticity; flexible timing generalizes better | Event cue + reminder based on when the learner actually practises |
| "A habit in 21 days" | Median 59–66 days, range 4–335 | Plan for months; keep supports on permanently |
| Accent or "native-likeness" scores | An accent does not by itself reduce intelligibility; engines score similarity to native speech | Frame scores as intelligibility, low-stakes |
| Slow audio as a crutch | Always follow slow audio with natural speed | Slow → natural; the slow version is dropped once mature |

**Where the evidence runs out:**

- **Sentences as the unit.** Very little spacing or testing research uses whole sentences.
- **Sentence counts and CEFR levels.** No study links numbers of sentences learned to CEFR levels.
- **One-new-word ordering.** It has never been tested against alternatives.
- **Streaks.** Every streak figure is company data on retention, not on learning.
- **Speech scores.** No engine publishes agreement with human raters, and TTS voices may not give the benefit of real multi-talker exposure.
- **The compare engine.** Its full sequence has never been tested as a system.
- **Open design parameters.** Whether immediate or delayed feedback is better for L2 vocabulary is unresolved, and no evidence-based optimal session length was found.
- **Forecasts.** Whether a forecast finish date helps or discourages learners is untested.
- **Not researched at all.** Egypt's data-protection law, LLM costs and hosting costs.

| Risk | Why it matters | Mitigation |
|---|---|---|
| Bad sentences | Translation errors and unnatural lines are the top complaint about Glossika and Tatoeba-based tools ([Mezzoguild](https://www.mezzoguild.com/glossika-review/); [StoryLearning](https://storylearning.com/clozemaster-review)) | Native review of 100% of sentences; an in-app flag button; rewrites driven by leeches |
| Workload wall | Each new card generates about 10 reviews a day at steady state | Budget-based pacer, simulator forecasts, recovery mode |
| Licensing | OpenSubtitles text, non-commercial Tatoeba audio, YouGlish commercial/mobile use, Unsplash hotlinking | Statistics-only use of subtitles; a licence field on every asset; video by embed only |
| Speech grading errors | Unvalidated engines; noise; accent effects unknown | Override button; per-learner thresholds; treat scores as signals |
| Voice privacy | Recordings are personal data | Delete by default; separate consent for anything else |
| Overpromising | B1 vocabulary is not B1 skill | Can-do checks; honest copy; recommend external tests |
| Solo-developer scope | Many subsystems | Strict MVP cut; content and scheduler first |
| LLM level drift | CEFR targeting was only 5–12.5% accurate | Generation limited to a vocabulary whitelist, then human review |

## 13. Twelve decisions to confirm before writing code

| # | Decision | Options | Recommended default |
|---|---|---|---|
| 1 | Gloss language | Arabic / English / both | Both, with a toggle: English for cognates and structure, Arabic for L1 contrasts |
| 2 | Platform | Web PWA / React Native | PWA first; note that YouGlish needs permission for mobile use |
| 3 | Where scheduling runs | Server (py-fsrs) / client (ts-fsrs) | Server in the MVP; the append-only log keeps offline use possible later |
| 4 | Retention target and default budget | 0.85 / 0.90; 20 / 30 / 45 min | 0.90 and 30 min (≈ 6–7 new sentences a day) |
| 5 | Pronunciation engine | Azure / SpeechSuper / ASR diff | Azure (covers de-DE, nl-NL and ar-EG) |
| 6 | Content source mix | Tatoeba-first / LLM-first | Tatoeba-first for German; LLM with a whitelist for gaps |
| 7 | Native reviewer | Paid / community / teacher | At least one paid native German reviewer |
| 8 | German variety | de-DE only / add Austrian and Swiss voices | de-DE for the MVP |
| 9 | Commercial or not | Free non-commercial / paid | Decide now: it sets the YouGlish, Tatoeba audio and KELLY terms |
| 10 | Image strategy | AI scenes / Pixabay stock / none in the MVP | AI scenes for concrete sentences, human-checked, no rendered text |
| 11 | Typing strictness | Accept *ae/oe/ue/ss*? Enforce noun capitals? | Accept the substitutions; a capitalization slip counts as Hard |
| 12 | Definition of "mastered" | By stability threshold | Both traces at stability ≥ 30 days |

## Conclusion

The research reframes what this app is. Its value is not a list of 3,000 sentences, since every competitor has one. The value lies in two pieces of machinery most apps skip. One is a content factory that turns frequency data into one-new-item sentences grouped by pattern. The other is a pacer that converts minutes into new sentences using FSRS's own workload forecasts, so the learner never hits a wall. Both are backend problems. It also helps to see "3,000 sentences" as a budget of roughly 200–250 hours of deliberate practice rather than a list. Framed that way, the roadmap stays honest about what else a learner must add (listening, reading, conversation) to turn B1-range vocabulary into B1 skill.

Each component has evidence, but the combination has never been tested as a system. Several parts (speech scores, streaks, sentence-level pattern families) rest on company claims or inference. The practical consequence is to instrument the MVP from day one. That means an append-only review log, measured seconds per exercise format, true retention against the 90% target, and checkpoint pass rates, with the first German learner treated as the first experiment. If measured retention, pace or checkpoint results drift from the estimates here, the log will show where. By then, FSRS's optimizer will already be fitting the real learner rather than the defaults.
