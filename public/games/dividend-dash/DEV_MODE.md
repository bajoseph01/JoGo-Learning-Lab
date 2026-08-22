# Dividend Dash DEV MODE

Open the `DEV` button in the top-right corner or append `?dev=1` to the game URL.

Direct states:

- Home
- First divide step
- Bring-down step
- Guided mistake
- Pit stop
- Results

DEV runs use an in-memory state with `dev: true`. `JogoStorage.save()` rejects all DEV writes, and the QA test compares local storage before and after the state-jump sequence.

Browser-console API:

```js
DividendDash.devJump("bring-down");
DividendDash.chooseCorrect();
DividendDash.commit();
DividendDash.snapshot();
```
