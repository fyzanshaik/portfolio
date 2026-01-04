---
layout: ../../layouts/BlogPost.astro
title: 'Atlan interview experience'
description: 'Encapsulating & sharing my experience getting intern role at Atlan'
date: 2026-01-01
tags: ['career', 'experience']
---

In this post I want to share my full experience from being rejected initially to being part of Atlan as an Intern.

## Applying to Atlan

Using social media you might come across engineer's with a stellar career to probably be from Atlan. From interns, engineers, founders and including ex employees everyone at Atlan or who were in always have an amazing work experiences and achievements which made me look into the company itself.

Every year Atlan takes intern batches and I was keen on getting selected. I applied in 2024 and wasn't selected sadly, I knew I wanted to join this company so I dropped my prev intern(which was amazing) and doubled down on learning more backend topics that could help me match my profile.

Atlan follows a unique process they aren't your judging your leetcode problem solving streaks/contests(al though having that is still beneficial), but they emphasis on projects and open source contributions. Your github profile, the authenticity and uniqueness of your projects and work experience matters a lot. Initially when I applied my resume was curated to a full stack generic profile with just AI applications which was fine but I was applying for backend specific roles and I made sure to spend my time making more backend projects in golang/java/c++, concrete low level projects and contributed to open source projects.

This change helped me standout and I got shortlisted for the first round!

## All rounds

I went through around 4 rounds:

1. Coding round on hackerrank
2. Take home assignment
3. HLD interview on submission + DSA + fundamentals
4. Cultural/HR round

### Coding round

The hackerrank round was backend specific I had to solve 4 mock-production applications and their bugs, build API's with db schema and db calls, you get 3 languages java python and go and you can solve all 3/4 questions in any one language although I solved all of them (it took me around 6 hours, I forogt I was supposed to only attempt for one). This was tiring and challenging, I was able to code by myself here as the statements were pretty straightforward you just had to type a lot.

### Take home assignment

I made it through this round, and got the mail for take home assignment. We were given two assignments to pick from one was using their AI sdk and building an application on top of it, other was making a ticket booking system the requirements emphasized on scalability of the backend, reliability and consistency. This was new to me, I learnt golang and had an idea of building REST api's but not much knowledge about a system design specific application.

After researching from blogs/videos and existing projects, I went through bookmyshow to see how everything is working and had a pretty good idea on what I wanted to built. I started with a optimistic concurrency approach for my early implementation and focused on creating different microservices and using applications such as elasti search/redis/psql to create a robust scalable microservice pattern.

Coming from a full stack oriented setup I went with a mono-repo setup I really did not want seperate folders for each service and went with my own approach which helped me a lot in shipping fast. This took lots of nights I was managing exams and coding all night long to get this working, the real challenge began when I deployed it on production and had to learn lots and lots about reverse proxies/networking events and load balancing.

I wish I used more AI it could had helped me ship faster and made more features but nevertheless I had a pretty good working application with every edge case I could think of, only missing feature was pessimistic concurrency setup. Looking back I would had implemented microservice communication with gRPC and a few more better choices in db schema.

You can check it out here! [Github repo](https://github.com/fyzanshaik/bookmyevent-ily)

### HLD round (technical interview)

For this interview I had my midsems going on I had no gap of free time, so I couldn't prepare 100% as what I wanted myself to be, I was too exhausted coming from college after exam and I prepared with whatever time I had left then.The interview began with a senior software engineer who first introduced himself and then asked me to introduce myself. From the start of the interview the experience was amazing, the interviewer made sure I was comfortable for the interview, we discussed about my resume first and then the project, the questions were deep and just they asked me about each and every thing I did in my past experiences, also pointed the gap in my resume (as I quit my intern I didnt have any experience to fill for 3 months) asked me why, then we dove into the project asked me about concurrency, what was optimistic concurrency why did I choose it, backend routing questions.
Some of them I was able to answer well enough but I fumbled at a few things which I knew the answer for such as ACID database examples I knew what they did but got stressed and forgot most stuff which were also mentioned in my resume like N+1 query optimizations. I kind of lost confidence here but still held on and pushed myself. At the end a coding round happened where I was tasked to build a rate limiter algorithm, I knew how token bucket worked so I explained but at the time I couldn't code it fully. The interviewer then asked me more questions about myself this lasted for around 60 minutes exactly and was really good.

I didn't have much confidence that I would proceed knowing they would reject at each round but thankfully I made it through till cultural round!
All the things I missed I made sure to understand them ASAP and brush myself up, all in all I would say just have faith and be honest with yourself and to the interviewer.

### Cultural round

This was the best interview I have ever had, I made sure to prepare myself well this time. Atlan does reject candidates after cultural rounds. Its a test to see if you fit in their teams or not and match their values. The core Atlan values are amazing they emphasis on growing you+team.[Atlan core values](https://blog.atlan.com/team/how-we-live-our-cultural-values-every-day/). I did my research well, my interview was with the director of AI engineering @Atlan. As they were living in USA the interview was scheduled a bit late at night for me. The interviewer started introducing themselves and asked me to introduce myself, then I was asked about my childhood what I used to do in tech, why am I even pursuing tech as a career my motives my goals, we discussed about games/ DIY projects I used to do, my embedded system projects and everythign I did in my previous intern. This was in depth every single question had value and insight and I had a lot of fun doing it. At the end of the interview which lasted longer than the scheduled time I was pretty confident that I did well and got a pretty good feedback from the interviewer himself.

After waiting for 2 weeks I got my mail that I was in! This was a pretty amazing feeling, I failed or was ignored by other MNC roles. I wasn't keen on relying on college placements(which I still got in). This was a huge roller coaster had to handle quite a lot of negative feelings while doing this but I am glad I'll be joining Atlan from Jan 2026!

Hopefully this was a nice read for you, there's still quite a lot of stuff I need to learn but I am excited to share and grow now, so do keep going!
