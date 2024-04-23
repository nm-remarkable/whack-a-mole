# Current Diagnostics

### Logging Diagnostic

Will find instances of logging and then the logging level

example:

```python
    logger.debug("blah blah")
----
    logger.critical("blah blah")
```

### Type Diagnostic

Will find instances of swear words in your code (obviously it's purposefully build as a bad swear filter). In this example we find the word `ass` and we replace it with the more respectable word `rear`.

```cpp
class:
    int n
    int m

----

clrear:
    int n
    int m
```

### Nuke Diagnostic

The most fun of all the diagnostics. It makes your editor blink red with a warning message and then deletes the entire file. You're welcome.

## TODO

[ ] Add some simple git commands like:

-   `git commit -a --amend --no-edit --no-verify`
-   `git stash`
-   (Opt) `git checkout -b <name-of-branch>-v2`
-   (Opt) `git rebase origin/<main>` or master
-   (Opt) `git cherry-pick <latest-commit-in-repo>`

[ ] Support different languages for the Diagnostics that need it

[ ] ConstDiagnostic

-   language dependent
-   execute changes `const` to `let` or `var` to `const` or deletes `mut`, basically it throws you off

[ ] AssigmentDiagnostic

-   More for golang, change between `=`and `:=`
-   Figure out how it can apply to other languages too

[ ] TypeHintDiagnostic

-   Maybe just make everythig `T` or `any` for fun

[ ] ErrDiagnostic

-   Make golang `err` variable disappear by making it an `_` so if the same function is using another `err`above that function gets skipped
-   Figure out how to troll other languages (Rust is probably a fun one here too)
