# Google Home Wikipedia summariser

This is a "fulfillment" for API.AI, intended for use with Google Home, that
will query SMMRY for a summary about a particular topic.

Example useage would be saying "Teach me about Saturn", and the bot will respond
with several sentences summarising the Wikipedia article on Saturn.

## Instructions

Set up an API.AI agent with contexts such as "Tell me about x". Set x to be
an action of @sys.any:article. Name this action "summarise.article".

Enable Fulfillment, and point it to your web host.

Run with `SMMRY_API_KEY=<apikey> node app.js`

## Problems?

When I run the bot locally, with ngrok to forward requests, the total time from
receiving a query, asking SMMRY for a summary, receiving that, and sending the
response back to API.AI can exceed the five second timeout. So, I store
queries in a map, so if a query times out, just ask a second time and you'll
get the cached result.