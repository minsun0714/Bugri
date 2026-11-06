const [major, minor, patch] = process.versions.node.split('.').map(Number);
if (major !== 22 || minor < 23 || (minor === 23 && patch < 3)) {
  console.error(`\nBugri requires Node >=22.23.3 <23; current: ${process.version}\nExecutable: ${process.execPath}\nStop the dev server, then run in this terminal:\n  nvm use\n  node -v\n  npm run dev\nIf launched by Orca, restart its terminal/runtime with Node 22.23.3.\n`);
  process.exit(1);
}
console.log(`Bugri runtime: ${process.version} (${process.execPath})`);
