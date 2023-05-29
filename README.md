# Bunni LIT Discord bot

Tested on nodejs 16.x

### Dev

`npm run dev`

### Run

Copy and paste `.env.sample` and rename to `.env`. Fill in discord token and rpc variables.

`npm run build`
`npm start`

### Create Discord Application

`https://discord.com/developers/applications`

New Application -> Set name
Sidebar -> Bot -> Reset Token -> Copy token -> Paste into `.env`
Sidebar -> General Information -> Copy Application Id

Replace `YOUR_APPLICATION_ID` in the following link with the actual Application Id you just copied.

`https://discord.com/api/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=0&scope=bot`

Paste the url into a browser and authorise the bot to join the server.
