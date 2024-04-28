## Extra Software Configuration

If this is your first time installing `git`, you may need to do a little bit of
additional configuration.  Type the following commands in your terminal (Note:
you should use *your* name and email):

```bash
git config --global init.defaultBranch main
git config --global user.email "rsmith123@some.email.address.com"
git config --global user.name "Riley Smith"
git config --global pull.rebase false
```

You will also want to do a little bit of configuration in VSCode.  You can get
to the settings in VSCode by pressing `F1`, typing `settings` into the search
box, and then choosing "Open Settings (UI)".

- Using the search bar, find "Editor: **Format On Save**" and set it to true.
- Then find "Typescript > Format: **Enable**" and be sure to check it.
