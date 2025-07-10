{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  buildInputs = [
    pkgs.flyctl
    pkgs.nodejs_22
    pkgs.pnpm_10
    pkgs.nodePackages_latest."@tailwindcss/language-server"
    pkgs.emmet-language-server
    pkgs.typescript-language-server
    pkgs.nodePackages_latest.prettier
    pkgs.nodePackages_latest.vscode-langservers-extracted
  ];
}
