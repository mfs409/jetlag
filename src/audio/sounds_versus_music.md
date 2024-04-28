## Sounds Versus Music

In JetLag, there is a distinction between sounds and music: Even though they are
both created from the same kinds of audio files (.mp3, .wav, .ogg), they play
different roles.  `Music` refers to audio files that are long, and that you want
to loop, so they can serve as background music for your game.  `Sound` refers to
things that are short, don't loop, and should play in response to certain
events.

Part of how we see this is in the way that the `Config` object treats them as
separate things:

```typescript
  musicNames = [];
  soundNames = ["flap_flap.ogg", "high_pitch.ogg", "low_pitch.ogg", "lose_sound.ogg", "slow_down.ogg", "win_sound.ogg"];
```

Since this tutorial focuses on sound effects (sounds), you'll need to put these six files into your `assets` folder:

- [flap_flap.ogg](audio/flap_flap.ogg)
- [high_pitch.ogg](audio/high_pitch.ogg)
- [low_pitch.ogg](audio/low_pitch.ogg)
- [lose_sound.ogg](audio/lose_sound.ogg)
- [slow_down.ogg](audio/slow_down.ogg)
- [win_sound.ogg](audio/win_sound.ogg)

As with images, you should avoid having spaces in the names of your sound files!
