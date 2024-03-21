# whack-a-mole

Read the license.

## Things I want to do before shipping shit

[ ] Settings panel:

[ ] Left side panel to start game (?) or just start right away

[ ] Left side panel to change timers of game or to change difficulty

-   Easy
-   Normal
-   Hard
-   (Optional) Extreme ==> Add all kinds of git commands

[ ] (Optional) gifs for every warning?

[ ] Add some simple git commands like:

-   `git commit -a --amend --no-edit --no-verify`
-   `git stash`
-   (Opt) `git checkout -b <name-of-branch>-v2`
-   (Opt) `git rebase origin/<main>` or master
-   (Opt) `git cherry-pick <latest-commit-in-repo>`

[ ] Should there be only one Diagnostic at a time or more? 3 seems like a good enough idea

[ ] Support different languages for the Diagnostics that need it

[ ] How fast does it need to be? How many warnings per minutes should it show, should be something more on the fun side instead of inhibiting any possible work ever

[ ] Point system? How do you win, how do you actually have fun

[ ] Diagnostic weight so some diagnostics appear more often than others. Nuke for example should be super rare.

## Ideals for specific diagnostics

[x] NukeDiagnostic

-   Must induce panic by blinking the entire file with an error
-   There is nothing you can do until it goes off
-   It deletes the entire current document
-   You can `Ctrl + z` back, I'm not crazy

[ ] SwearDiagnostic

-   Find more words to use as swears
-   execute changes the swear word to a stupid emoji relating to it

[ ] ConstDiagnostic

-   a bit more of a pain in the ass
-   language dependent
-   execute changes `const` to `let` or `var` to `const` or deletes `mut`, basically it throws you off

[ ] LoggingDiagnostic

-   learn a bit about how logging happens in several languages
-   execute will flip around `debug` to `critical` etc at random

[ ] AssigmentDiagnostic

-   More for golang, change between `=`and `:=`
-   Figure out how it can apply to other languages too

[ ] TypeHintDiagnostic

-   Maybe just make everythig `T` or `any` for fun

[ ] ErrDiagnostic

-   Make golang `err` variable disappear by making it an `_` so if the same function is using another `err`above that function gets skipped
-   Figure out how to troll other languages (Rust is probably a fun one here too)
