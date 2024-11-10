cd $(dirname "$0")
export $(cat .env | xargs) 
bun run src/index.ts > /tmp/feishin-scrobbler.log