Day 26 - One .proto file. Server + Browser. Zero hand-written wire types.


🚀TechFromZero Series - gRPCFromZero


🌐 Try it live: https://grpc-from-zero.vercel.app


This isn't a Hello World. It's a real Connect-RPC microservice:
📐 React → connect-web → Connect-RPC → Free Dictionary API


🔗 The full code (with step-by-step commits you can follow):
https://github.com/dev48v/grpc-from-zero


🧱 What I built (step by step):
1️⃣ A real .proto contract — DictionaryService with Define + WordOfTheDay + Health RPCs

2️⃣ Buf + protoc-gen-es generating typed TypeScript into BOTH workspaces

3️⃣ Free Dictionary REST client with native fetch + 6-hour TTL cache

4️⃣ Connect-RPC service handlers mapping REST shapes into proto messages

5️⃣ Node http server with connectNodeAdapter — gRPC, gRPC-Web, and Connect protocol on one port

6️⃣ Multi-stage Dockerfile (alpine, non-root) + Render Blueprint deploy

7️⃣ React + Vite + connect-web client calling the SAME proto types

8️⃣ Word-of-the-day, debounced search, pronunciation audio, localStorage history


💡 Every file has detailed comments explaining WHY, not just what. Written for any beginner who wants to learn gRPC by reading real code — with full clarity on each step.

👉 If you're a beginner learning gRPC, clone it and read the commits one by one. Each commit = one concept. Each file = one lesson. Built from scratch, so nothing is hidden.

🔥 This is Day 26 of a 50-day series. A new technology every day. Follow along!


🌐 See all days: https://dev48v.infy.uk/techfromzero.php


#TechFromZero #Day26 #gRPC #LearnByDoing #OpenSource #BeginnerGuide #100DaysOfCode #CodingFromScratch
