# Jo⚡Go iPad QA Checklist

## Required viewport

At minimum test:

- 1024×768 landscape

Also test portrait if the game claims portrait support.

## Touch

- [ ] All core controls work with Pointer Events.
- [ ] No hover-only instructions.
- [ ] Tap targets are comfortably large.
- [ ] Drag targets do not require pixel-perfect contact.
- [ ] Page scrolling/zoom gestures do not interfere with core gameplay.
- [ ] Rapid repeated taps do not create duplicate state changes.

## Layout

- [ ] No clipped text.
- [ ] No horizontal page scroll.
- [ ] HUD remains readable.
- [ ] Main play object remains fully visible.
- [ ] Keyboard/keypad does not push essential content off-screen.
- [ ] Safe spacing exists around edges.

## Visual clarity

- [ ] Active pointer/needle/marker has strong contrast.
- [ ] Labels do not overlap diagrams.
- [ ] Feedback can be seen without hunting.
- [ ] Decorative elements cannot be mistaken for answer/measurement marks.

## Classroom usability

- [ ] Game reaches play quickly from a URL.
- [ ] Sound can be muted.
- [ ] Learner can recover from accidental refresh.
- [ ] DEV mode is hidden/clearly separated from learner play.
- [ ] No external login required.

## QA evidence

Save at least:

- menu screenshot;
- gameplay screenshot;
- alternate mechanic/state screenshot;
- results screenshot;
- one close-up of every educational hero instrument.
