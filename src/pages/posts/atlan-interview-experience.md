---
layout: ../../layouts/BlogPost.astro
title: 'Atlan interview experience'
description: 'Encapsulating & sharing my experience getting into Atlan'
date: 2026-01-01
tags: ['interview', 'internship']
---

In this post I want to share my full experience from being rejected initially to becoming part of Atlan.

## Why I Applied

Atlan is an active metadata platform that helps organizations unify context across their data and AI systems. They provide data discovery, catalog, governance, lineage, and quality solutions, working with major enterprises to bridge the gap between data and AI value. Using social media you might come across engineers with stellar careers who are probably from Atlan. Everyone at Atlan (interns, engineers, founders, and even ex-employees) always has amazing work experience and achievements, which made me look into the company itself.

Every year Atlan takes intern batches and I was keen on getting selected. I applied in 2024 and wasn't selected. I knew I wanted to join this company, so I dropped my previous internship (which was amazing) and doubled down on learning more backend topics that could help me match my profile and goal to be a backend engineer.

Atlan follows a unique process: they aren't judging your leetcode problem solving streaks/contests (although having that is still beneficial), but they emphasize projects and open source contributions. Your GitHub profile, the authenticity and uniqueness of your projects and work experience matters a lot. Initially when I applied, my resume was curated to a full stack generic profile with just AI applications, which was fine, but I was applying for backend specific roles. I made sure to spend my time making more backend projects in golang/java/c++, concrete low level projects, and contributed to open source projects.

This change helped me stand out and I got shortlisted for the first round!

## The Interview Process

I went through 4 rounds:

1. Coding round on hackerrank
2. Take home assignment
3. HLD interview on submission + DSA + fundamentals
4. Cultural/HR round

### Round 1: Coding Assessment (HackerRank)

The hackerrank round was backend specific. I had to solve 4 mock-production applications and their bugs, and build APIs with db schema and db calls. You are given 3 languages (java, python, and go) and can solve all 3/4 questions in any one language, although I solved all of them (took me around 6 hours, forgot I was supposed to only attempt one). This was tiring and challenging. I was able to code by myself here as the statements were pretty straightforward: you just had to type a lot. If you are good at building APIs and know how each layer works from API to middleware to DB, and can code by yourself, you should be fine.

### Round 2: Take-Home Assignment

I made it through this round and received the email for the take-home assignment. We were given two assignments to pick from: one was using their AI SDK and building an application on top of it, the other was making a ticket booking system. The requirements emphasized scalability of the backend, reliability and consistency. This was new to me. I learned golang and had an idea of building REST APIs but didn't have much knowledge about system design-specific applications.

After researching from blogs/videos and existing projects, I looked at bookmyshow to see how everything works and had a pretty good idea of what I wanted to build. I started with an optimistic concurrency approach for my early implementation and focused on creating different microservices and using applications such as Elasticsearch/redis/psql to create a robust scalable microservice pattern.

Coming from a full-stack oriented setup, I went with a mono-repo setup. I really did not want separate folders for each service and went with my own approach which helped me a lot in shipping fast. This took many nights as I was managing exams and coding all night long to get this working. The real challenge began when I deployed it on production and had to learn a lot about reverse proxies, networking events and load balancing.

I wish I had used more AI (it could have helped me ship faster and made more features), but nevertheless I had a pretty good working application with every edge case I could think of. The only missing feature was pessimistic concurrency setup. Looking back, I would have implemented microservice communication with gRPC and made a few better choices in the db schema.

You can check it out here! [GitHub repo](https://github.com/fyzanshaik/bookmyevent-ily)

### Round 3: Technical Interview (HLD)

For this interview, I had my midsems going on. I had no gap of free time, so I couldn't prepare 100% as I wanted to. I was too exhausted coming from college after the exam and prepared with whatever time I had left. The interview began with a senior software engineer who asked me to introduce myself. From the start, the experience was amazing. The interviewer made sure I was comfortable. We discussed my resume first and then the project. The questions were deep and they asked me about everything I did in my past experiences. They also pointed out the gap in my resume (as I quit my intern I didn't have any experience to fill for 3 months) and asked me why. Then we dove into the project. They asked me about concurrency, what optimistic concurrency was, why I chose it, and backend routing questions.
I was able to answer some of them well enough, but I fumbled at a few things which I knew the answer for, such as ACID database examples. I got stressed and forgot most of the things that were also mentioned in my resume, like N+1 query optimizations. I kind of lost confidence here but still held on and pushed myself. At the end, a coding round happened where I was tasked to build a rate limiter algorithm. I knew how token bucket worked, so I explained it, but at the time I couldn't code it fully. The interviewer then asked me more questions about myself. This lasted around 60 minutes and was really good.

I didn't have much confidence that I would proceed knowing they would reject at each round but thankfully I made it through till cultural round!
I made sure to understand everything I missed ASAP and brush myself up. All in all I would say just have faith and be honest with yourself and to the interviewer.

### Round 4: Cultural Fit Interview

This was the best interview I have ever had. I made sure to prepare myself well this time. Atlan does reject candidates after cultural rounds. It's a test to see if you fit in their teams or not and match their values. The core Atlan values are amazing: they emphasize growing you+team. [Atlan core values](https://blog.atlan.com/team/how-we-live-our-cultural-values-every-day/). I did my research well. My interview was with the director of AI engineering @Atlan. Since they were living in the USA, the interview was scheduled a bit late at night for me. The interviewer asked me to introduce myself. Then I was asked about my childhood, what I used to do in tech, why I am pursuing tech as a career, and my goals. We discussed games/DIY projects I used to do, my embedded system projects and everything I did in my previous intern. This was in-depth. Every single question had value and insight and I had a lot of fun doing it. At the end of the interview, which lasted longer than the scheduled time, I was pretty confident that I did well and got pretty good feedback from the interviewer himself.

After waiting for 2 weeks I got my mail that I was in! This was a pretty amazing feeling. I failed or was ignored by other MNC roles. I wasn't keen on relying on college placements (which I still got in). This was a huge roller coaster. I had to handle quite a lot of negative feelings while doing this, but I am glad I joined Atlan in Jan 2026 and later converted to a software engineer role.

Hopefully this was a nice read for you. There's still a lot to learn, the people here are all cracked af but I am excited to start my path!

ps follow me on [X](https://x.com/fyzanshaik):))

![X post](/posts-mages/x-post.png)
