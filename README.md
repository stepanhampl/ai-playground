# "AI Playground" - Simple AI Agent
* This is my personal project.

## What Did I Learn
* Here I tried to call LLM in a loop and give it few tools to use.
* It is not very useful, compared to agents like Claude Code, but at least I learned the very basic way to give LLM some tools.
* This way of giving tools to LLM is useful mainly for small number of tools.
* If I would add many tools in the future, I would probably explore different approach. For example somehow let LLM discover what tools are available, instead of sending all tool definitions with each user's message (which this project currently does).

## Technologies Used
* Backend is in Python3.
* Frontend is in plain JS (I plan to change it into React with TS).
* Docker and Docker Compose is used for running backend and frontend.
* Python uses (and creates if not present) SQLite database file.

## How It Works
* You will need Docker installed on your machine.
* Create `.env` based on `.env.example`. You do not need to set LLM_PROVIDER if you don't use provider routing in openrouter. For LLM_NAME I personally used "minimax/minimax-m2.7".
* Run `docker compose up --build` to start the app.
* Open `http://localhost:8000/` in browser.
* Chat.
* You can also switch to one of the previous chats (which persist even when running `docker compose down`)
* Agent can use tools. These are listed in `backend/toolkit/tools`.
* Agent has access only to `workspace` directory. Place there your files you want agent to work with and get there files modified/created by agent. 

## Use Of AI For Coding
* So far I used my self-hosted Hermes agent running on minimax-m2.7 LLM to write lots of code in this codebase. At first the Hermes agent used my account, but later I created him this account: [@stepanhampl-bot](https://github.com/stepanhampl-bot)
* I also used Claude Code to write code for this project.
* Each time i used AI to write code, I reviewed it, so I wouldn't say this was vibe-coded (but it depends on definition of vibe-coding).
* This README was not written by AI. :)

## QA
* To run all the tests, run `./run-all-tests.sh`. This will consume little bit of LLM tokens, because there are end-to-end tests.
* In the future I might add option to select from multiple models - end-to-end testing could use cheaper model than when you use the app. I don't think mocking LLM API calls would be possible for all tests, since they also check for context retention (dummy response wouldn't be enough).
