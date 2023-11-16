## Local Testing

1. `vercel dev` or `dotenv -e .env.local vercel dev`
2. `ngrok http 3000`
3. `curl -X POST https://api.telegram.org/bot6699648946:AAEQWwPSeyzSBQCGQewCt1PPfZa-VWq7sQQ/setWebhook -H "Content-type: application/json" -d '{"url": "https://cabc-136-57-20-238.ngrok.io/api/bot"}'`

   - replace the ending url with the url generated from step 2
   - to point the bot back to vercel use `curl -X POST https://api.telegram.org/bot6699648946:AAEQWwPSeyzSBQCGQewCt1PPfZa-VWq7sQQ/setWebhook -H "Content-type: application/json" -d '{"url": "https://dcbot-grammy.vercel.app/api/bot"}'`
   - Point to `refactor` branch: `curl -X POST https://api.telegram.org/bot6699648946:AAEQWwPSeyzSBQCGQewCt1PPfZa-VWq7sQQ/setWebhook -H "Content-type: application/json" -d '{"url": "https://dcbot-grammy-git-refactorcommands-ferric.vercel.app/api/bot?branch=refactorCommands"}'`

4. Flush TG pending messages:

```
curl -X POST https://api.telegram.org/bot6699648946:AAEQWwPSeyzSBQCGQewCt1PPfZa-VWq7sQQ/deleteWebhook -H "Content-type: application/json" -d '{"drop_pending_updates": true}'

{"ok":true,"result":true,"description":"Webhook was deleted"}%

```

curl -X GET https://api.telegram.org/bot6699648946:AAEQWwPSeyzSBQCGQewCt1PPfZa-VWq7sQQ/getWebhookInfo -H "Content-type: application/json"
{"ok":true,"result":{"url":"","has_custom_certificate":false,"pending_update_count":0}}%

```

```

curl -X POST https://api.telegram.org/bot6699648946:AAEQWwPSeyzSBQCGQewCt1PPfZa-VWq7sQQ/setWebhook -H "Content-type: application/json" -d '{"url": "https://0e33-2603-8080-d9f0-79b0-cda0-4d87-17bc-c85c.ngrok.io/api/bot"}'
{"ok":true,"result":true,"description":"Webhook was set"}

```

```
