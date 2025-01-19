:title Devlog Season One Episode Two: Zig Setup
:description devlog season one episode one
:date 2025-01-19
:slug zig-setup
:category Devlog Season One

Now that I selected zig, time to configure my development environment.
My primary personal operating system is MacOS[^1] and I use [Sublime Text](https://www.sublimetext.com) as my text editor.[^2]

Zig is pre 1.0 software so I anticipate installing many different versions of the toolchain throughout this adventure.
Exactly what [zigup](https://github.com/marler8997/zigup) is built to do.
A few short commands later (`curl -L https://github.com/marler8997/zigup/releases/download/v2025_01_02/zigup-aarch64-macos.tar.gz | tar xz`, `sudo mv zigup /usr/local/bin`, and `zigup 0.13.0`) and we are ready to go.

To simplify some of the code navigation and documentation questions I enjoy using language server integration with sublime.
After a quick trip through the [ZLS Installation Guide](https://zigtools.org/zls/install/) and [Sublime Text Configuration](https://zigtools.org/zls/editors/sublime-text/) as well as a brief detour through Gatekeeper dialogs I have lanugage server working.

Success!

Next time on devlog: building my favorite data structure the stable bloom filter.

[^1]: As a survivor of the butterfly keyboard I can now reap my battery and thermal rewards with Apple Silicon. And no ads in my start menu. Oh, the wifi also works.
[^2]: I am particularly fond of both emacs and vim as systems for mangling text but I much prefer to use native graphical interfaces for day to day work. Running a persistent daemon for emacs or one of the 2 dozen hobby projects that wrap neovim is one level of tinkering too far for me at this phase in my life. I rely on MacOS to handle the window layout and session persistence instead.