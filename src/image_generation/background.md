## Background

JetLag's  `ImageSprite` and `AnimatedSprite` are built from Pixi's `Textures`.
Normally, we do this through the `ImageSprite` and `AnimatedSprite` types, which
ask for an image by its filename, get the texture associated with that image,
make a Pixi sprite from the texture, and then make a JetLag sprite from the Pixi
sprite. That may seem confusing, but it lets the insides of JetLag remain clean
and easy to manage.  Fortunately, it is not expensive to compute, either.

Pixi lets us *create* textures, too.  The key idea here is that we can create a
Pixi `Container`, put some textures into it, and then extract a single
"flattened" Texture from the container.  JetLag has a way of making its
`ImageSprite` and `AnimatedSprite` from these Pixi textures, instead of a
filename.

So the, putting it all together, we're going to do the following:

- Get a bunch of textures directly from Pixi.js
- In some cases, re-color the texture by using a filter
- Put the textures into a container
- Extract one texture from the container
- Create an ImageSprite from that texture

Here's the [final code](game.ts), and here's how it will look when we're done:

<iframe src="./game.iframe.html"></iframe>
