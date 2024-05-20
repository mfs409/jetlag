## Sounds Versus Music

In JetLag, there is a distinction between sounds and music: Even though they are
both created from the same kinds of audio files (.mp3, .wav, .ogg), they play
different roles.  `Music` refers to audio files that are long, and that you want
to loop, so they can serve as background music for your game.  `Sound` refers to
things that are short, don't loop, and should play in response to certain
events.

```admonish Note
You should avoid using WAV files, since they are very large. MP3 and OGG formats
are compressed, and take up less space.  You can use tools like [Audacity]
(https://www.audacityteam.org/) to convert among file formats
```

Part of how we see the difference between sound and music in the way that the
`Config` object treats them as separate things.  For sounds, we'll use the
`soundNames` field of the `Config` object:

```typescript
{{#include game_15.ts:8:21}}
```

Since this chapter focuses on sound effects (sounds), you'll need to put these six files into your `assets` folder:

- [flap_flap.ogg](../assets/flap_flap.ogg)
- [high_pitch.ogg](../assets/high_pitch.ogg)
- [low_pitch.ogg](../assets/low_pitch.ogg)
- [lose_sound.ogg](../assets/lose_sound.ogg)
- [slow_down.ogg](../assets/slow_down.ogg)
- [win_sound.ogg](../assets/win_sound.ogg)

You'll also need this sprite sheet:

- [sprites.json](../assets/sprites.json)
- [sprites.png](../assets/sprites.png)

And you'll need this file:

- [common.ts](common.ts)

As with images, you should avoid having spaces in the names of your sound files!
