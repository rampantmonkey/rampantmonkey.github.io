with import <nixpkgs> {};
stdenv.mkDerivation rec {
  name = "rm_web";
  env = buildEnv { name = name; paths = buildInputs; };
  buildInputs = [
    hugo
    rsync
  ];
}

