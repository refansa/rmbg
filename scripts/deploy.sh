#! /bin/bash

# Exit, if a command fails
set -e

export REMBG_PORT=3600
export GUNICORN_WORKER=2
export GUNICORN_THREAD=2
export GUNICORN_MAX_REQUESTS=10

export NGROK_URL=""

INFO_PROMPT="$(tput setaf 6)info  $(tput sgr0)-"

echo "${INFO_PROMPT} Initializing Pre-deployment"
gunicorn -b 0.0.0.0:${REMBG_PORT} -b [::1]:${REMBG_PORT} -w ${GUNICORN_WORKER} -k uvicorn.workers.UvicornWorker --threads ${GUNICORN_THREAD} --max-requests ${GUNICORN_MAX_REQUESTS} backend.api:app &>./logs/gunicorn-prod.log &
echo "${INFO_PROMPT} Successfully started gunicorn server"

ngrok http ${REMBG_PORT} --log=./logs/ngrok-prod.log &>/dev/null &
echo "${INFO_PROMPT} Successfully started ngrok tunnel"

echo "${INFO_PROMPT} Writing NGROK_URL variable to .env"
while [[ -z "${NGROK_URL}" || "${NGROK_URL}" == "null" ]]; do
	NGROK_URL="$(curl --silent http://127.0.0.1:4040/api/tunnels | jq '.tunnels[0].public_url')"
done

NGROK_URL="${NGROK_URL:1:-1}"

echo NGROK_URL=${NGROK_URL} >.env
echo "${INFO_PROMPT} ngrok tunnel: ${NGROK_URL}"
echo "${INFO_PROMPT} Pre-deployment initialized successfully"
echo ""

vercel env rm NGROK_URL production -y &>/dev/null
echo ${NGROK_URL} | vercel env add NGROK_URL production
echo "${INFO_PROMPT} Writing NGROK_URL variable to vercel env add NGROK_URL production"
echo "${INFO_PROMPT} Starting vercel --prod..."
vercel --prod &>./logs/vercel-prod.log
echo "${INFO_PROMPT} Successfully started vercel--prod"
echo "${INFO_PROMPT} Successfully deployed app - CTRL+C to stop servers"
while :; do
	sleep 1s
done
