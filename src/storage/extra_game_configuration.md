## Extra Game Configuration

Up until now, we've been ignoring the `storageKey` value in your `Config`
object.  This is a string that your game gives to the web browser, so that your
browser can save information for your game even when the browser is closed.

A convention that emerged more than 20 years ago is to generate human-readable
names by using web addresses.  So if my game was called "HappyGame" and my
website was "JetLagGameFramework.com", then I could use
`"com.JetLagGameFramework.HappyGame"` as my `storageKey`.

For these tutorials, you can use the name of your GitHub project fork.  So, for
example, I'll use `"com.github.mfs409.my-jetlag-tutorials`.