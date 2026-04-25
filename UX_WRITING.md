# Condensed UX Writing Style Guide for LLMs

## Core Principles
* **Style:** Use American English, active voice, and sentence case for all labels and titles.
* **Clarity:** Prioritize direct, natural language over cleverness. Keep sentences focused on one idea.
* **Perspective:** Address the reader as **"you/your"**. Do not use "we/us/our", "user", or "please".
* **Grammar:** Use contractions (*isn’t*, *couldn't*). Use "impact" instead of "affect" for consequences.

## Voice and Tone
* **Voice:** Professional, pragmatic, and guiding.
* **Tone:** Encouraging for success; calm, solution-focused, and non-blaming for errors.
* **Prohibitions:** Do not use "Success", "Successfully", or "Failed to...".

## UI Actions and Labels
* **Buttons:** Use action-oriented verbs.
    * `Create`: New items.
    * `Add`: Existing items or opening flows (default preference).
    * `Set/Define`: Values or logic.
    * `Remove`: Detach relationship.
    * `Delete`: Permanent removal.
* **Labels:** Describe the representation clearly. Placeholders should be examples, not instructions.
* **Articles:** Omit "a", "an", and "the" in short UI labels.

## System Messages
* **In-progress:** Present participle + ellipsis (*Actioning...*).
* **Completion:** Past tense (*Actioned*).
* **Errors:** State what happened and provide a recovery step.
    * *Pattern:* "Couldn't [action] [resource]. [Next step]."
* **Invalid Input:** "Invalid [field]. [Instruction]."
* **Destructive Actions:** Title must be a question. Body must mention "permanently delete". Confirmation button must repeat the title's verb.
* **Blockers:** List all requirements and one clear recovery step to proceed.

## Mechanics and Formatting
* **Punctuation:** Omit final periods for strings under 10 words. Use full stops for multi-sentence text.
* **Symbols:** No spaces around slashes (*and/or*). Use hyphens for compounds and en dashes for ranges (*1–10*).
* **Numbers/Dates:** Use thousands separators (*1,000*) and `DD/MM/YYYY` format.
* **Definitions:** Define acronyms on first use.

## Accessibility
* Use plain, inclusive language.
* Avoid color-only meaning and culture-specific idioms.
* Use "they/them" if a third-person pronoun is required.