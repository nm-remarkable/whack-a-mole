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

[ ] Should there be only one Diagnostic at a time or more?

[ ] Support different languages for the Diagnostics that need it

## Ideals for specific diagnostics

[x] NukeDiagnostic

-   Must induce panic by blinking the entire file with an error
-   There is nothing you can do until it goes off
-   It deletes the entire current document
-   You can `Ctrl + z` back, I'm not crazy
