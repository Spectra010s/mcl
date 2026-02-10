# SQF (Simple Question Format) Import Guide

The SQF format is a lightweight, line-based text format designed for bulk importing questions into the My Campus Library (MCL) CBT system.

## Format Overview

An SQF file consists of multiple question blocks. Each block starts with a `[TEXT]` tag.

### Available Tags

| Tag         | Description                                                                               | Examples                                    |
| :---------- | :---------------------------------------------------------------------------------------- | :------------------------------------------ | ---------------------------------- |
| `---`       | **Comment Line**. Any line starting with `---` is ignored by the parser.                  | `--- This is a comment`                     |
| `[TEXT]`    | **Question Text**. Defines the start of a new question. Can be multi-line.                | `[TEXT] What is ICT?`                       |
| `[TYPE]`    | **Question Type**. Supports `mcq` (default) or `boolean`.                                 | `[TYPE] boolean`                            |
| `[POINTS]`  | **Points**. Numerical value assigned to the question. Default is `1`.                     | `[POINTS] 2`                                |
| `[SHUFFLE]` | **Shuffle Options**. Toggles option shuffling. Set to `true` or `false`.                  | `[SHUFFLE] true`                            |
| `[OPT]`     | **Option**. Defines a multiple-choice option. Use `                                       | isCorrect:true` to mark the correct answer. | `[OPT] Answer A \| isCorrect:true` |
| `[EXP]`     | **Explanation**. Provides feedback shown to the user after submission. Can be multi-line. | `[EXP] ICT stands for...`                   |
| `[LIMIT]`   | **CBT Limit** _(Proposed)_. Sets the total number of questions to show per attempt.       | `[LIMIT] 30`                                |

---

## Parsing Rules

1.  **Implicit Question Separation**: A new `[TEXT]` tag automatically commits the previous question.
2.  **Multi-line Content**: Text following `[TEXT]` or `[EXP]` can span multiple lines until another tag is encountered.
3.  **Correct Answers**: At least one `[OPT]` must have `| isCorrect:true`.
4.  **Validation**: A question must have text, at least 2 options, and exactly 1 correct answer (for booleans and simple MCQs).

---

## Technical Implementation

### Parser Utility

Location: `lib/parser/sqf.ts`

The parser uses a state-machine approach. It iterates through lines, buffered content, and commits "sections" (Text, Options, Explanations) when a new tag is detected.

### Import API Route

Location: `app/api/admin/cbts/[cbtId]/questions/import/route.ts`

The API performs the following steps:

1.  **Authentication**: Checks for Admin role using Supabase `getUser()`.
2.  **Parsing**: Calls `parseSqf(content)`.
3.  **Validation**: Ensures all parsed questions are valid before starting database transactions.
4.  **Transaction**:
    - Inserts questions into the `questions` table using the Supabase Service Role Key.
    - Maps the returned question IDs to their respective options.
    - Bulk inserts options into `question_options`.

### Sorting Guarantee

During import, questions are assigned an `order_index` based on their position in the SQF file. This ensures that the generated options are correctly mapped to their respective questions even during bulk inserts.
