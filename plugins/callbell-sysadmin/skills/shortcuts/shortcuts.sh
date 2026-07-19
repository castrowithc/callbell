# >>> callbell shell shortcuts >>>
# Managed block: installed/updated by the callbell-sysadmin:shortcuts skill. Edit there, not by hand.

# Repo navigation
alias repos='cd "$HOME/repos"'
# Add one alias per project you cd into often, e.g.:
# alias myproject='cd "$HOME/repos/myproject"'

# tmux shortcuts (the functions take an argument = session name; tmux-l takes none)
tmux-n() { tmux new -s "$1"; }           # new session
tmux-a() { tmux attach -t "$1"; }        # attach to a session
tmux-k() { tmux kill-session -t "$1"; }  # end a session
alias tmux-l="tmux ls"                    # list sessions
# <<< callbell shell shortcuts <<<
