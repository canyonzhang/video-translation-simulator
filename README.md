# video-translation-simulator

## Overview

Server that simulates the 'status' client polling api for HeyGen video translation backend. Server implements a single endpoint, GET '/status'.

# GET '/status' endpoint

Returns the job's status (`pending`, `completed`, or `error`) as an object with `{result : (status)}`, which changes based on a configurable delay and error probability.

The project uses **Node.js** and **Express.js** for the server, and a custom polling library written in JavaScript for the client. It's designed to handle retries, timeouts, and configurable polling intervals.

## Setup

**1. Clone the repository:**

```bash
git clone https://github.com/canyonzhang/video-translation-simulator.git
cd video-translation-simulator
```

**2. Set up .env**

Create a custom .env with your own polling frequency and error probability set.

```bash
 POLLING_INTERVAL=
 ERROR_PROBABILITY=
```

## How to Use

Install dependencies

```bash
npm install
```

Start the server

```bash
npm run dev
```

Run tests

```bash
npm test
```
