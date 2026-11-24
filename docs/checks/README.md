# Checking the computer's work

Every figure on [/research](https://www.kinderform.org/research) and [/for-services](https://www.kinderform.org/for-services) rests on two jobs a computer did:

- it sorted each question on an enquiry or application form into a topic (`census/questions.csv`)
- it read the law on what an assessment must cover (`register/assessment.csv`)

Nobody has checked either yet. These two sheets let a person check a fixed sample. The results tell readers how far to trust the figures.

## The sheets

| Sheet | What is in it | What to check |
| --- | --- | --- |
| [`topic-sample.csv`](topic-sample.csv) | 30 questions from enquiry forms and 30 from applications, drawn at random | Is `computer_topic` right for the question? `topic_means` says what the topic covers. Open `form_link` if the question is unclear. |
| [`law-sample-england.csv`](law-sample-england.csv) | Every row of the law map for England, fostering and adoption | Does `requirement_summary` say what the law at `legal_citation` says, and is `stage` right? Open `source_url`. |

## How to fill them in

1. Open the sheet in any spreadsheet program.
2. In `correct`, write `yes`, `no` or `unsure`.
3. If the answer is `no`, say why in `notes`. In the topic sheet, put the right topic in `better_topic`, using a code from [`census/taxonomy.csv`](../../census/taxonomy.csv).
4. Save it as CSV, then run:

```bash
python3 tools/check_sample.py score
```

It reports how many rows were right, for each stage and each service.

Please do not write your name or anyone else's in the sheets. To say who checked, use the commit or pull request.

## Drawing the sample again

```bash
python3 tools/check_sample.py make
```

The sample uses a fixed seed, so it comes out the same each time. The tool will not overwrite a sheet that already has answers.
