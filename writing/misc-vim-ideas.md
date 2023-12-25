:title Miscellaneous Vim Ideas
:tags [vim]
:description A handful of small efficiency gains with vim
:date 2021-04-01

Sorting through my old Dropbox files I ran into a collection of notes from when I was learning Vim that still seemed relevant to share.

- Indentation based on syntax rules; `==` indents the current line and `V=` indents the visually selected region.
- Command history, `q:` to open and `q/` to search.
- `!mkdir -p %:h` to resolve "directory not created" errors.
- `F`, `f`, `T`, and `t` can be repeated with `;` and reversed with `,` (even works if other movement commands are issued in between).
- To wrap text visually select and use `gq`.
- map key to write and run a file `:map <leader>r :w\|:!./file.sh<cr>`.



