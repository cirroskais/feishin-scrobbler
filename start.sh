cd $(dirname "$0")
export $(cat .env | xargs) 
~/.bun/bin/bun run src/index.ts > /tmp/feishin-scrobbler.log
