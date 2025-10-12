---
layout: ../../layouts/BlogPost.astro
title: 'Building Real-Time Search with Elasticsearch'
description: 'How we achieved 75% query latency reduction using Elasticsearch and nginx API gateway'
date: 2025-01-15
tags: ['elasticsearch', 'search', 'backend', 'go']
---

Building BookMyEvent required a robust real-time search system that could handle thousands of concurrent queries while maintaining low latency.

## Why Elasticsearch?

Traditional database queries with `LIKE` statements don't scale. For our event booking platform, we needed:

- Full-text search
- Filtering by multiple fields
- Sub-second response times
- Relevance scoring

## Architecture

```
Client → Nginx API Gateway → Go Service → Elasticsearch
                          ↘ PostgreSQL (source of truth)
```

## Implementation

### 1. Index Structure

```json
{
  "mappings": {
    "properties": {
      "event_name": {
        "type": "text",
        "analyzer": "standard"
      },
      "location": {
        "type": "keyword"
      },
      "date": {
        "type": "date"
      },
      "available_tickets": {
        "type": "integer"
      }
    }
  }
}
```

### 2. Search Query

```go
func SearchEvents(query string, filters map[string]interface{}) ([]Event, error) {
    searchQuery := map[string]interface{}{
        "query": map[string]interface{}{
            "bool": map[string]interface{}{
                "must": []map[string]interface{}{
                    {"match": map[string]interface{}{"event_name": query}},
                },
                "filter": buildFilters(filters),
            },
        },
    }

    res, err := esClient.Search(
        esClient.Search.WithIndex("events"),
        esClient.Search.WithBody(esReader(searchQuery)),
    )

    return parseResults(res), err
}
```

## Performance Results

- **75% reduction** in query latency vs PostgreSQL LIKE queries
- Average query time: **<50ms**
- Handles **1000+ queries/second**

## Lessons Learned

1. Keep Elasticsearch synchronized with your primary database
2. Use bulk indexing for better throughput
3. Monitor cluster health and optimize shard allocation
4. Implement proper error handling and fallbacks

Elasticsearch transformed our search capabilities and user experience. The investment in proper setup and monitoring paid off with a highly scalable search system.
