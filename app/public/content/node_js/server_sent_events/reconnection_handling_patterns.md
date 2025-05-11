# Reconnection Handling Patterns in Server-Sent Events (SSE) in Node.js

Let me walk you through the fundamentals of handling reconnections in Server-Sent Events, starting from the absolute basics and building up to sophisticated patterns.

## What is Reconnection in the Context of SSE?

> Reconnection is the process of automatically re-establishing a connection between client and server when the original connection is lost due to network issues, server downtime, or other interruptions.

Think of it like a phone call that gets dropped. Instead of having to manually redial, the phone automatically tries to reconnect. That's exactly what reconnection does for SSE connections.

## Why Do We Need Reconnection Handling?

In the real world, connections can break for various reasons:

1. **Network Interruptions** : WiFi drops, mobile connection loss
2. **Server Maintenance** : The server needs to restart
3. **Load Balancer Issues** : Traffic gets rerouted
4. **Client Device Issues** : Browser hibernation, device sleep

> Without proper reconnection handling, your real-time application would permanently lose its connection to the server when any of these events occur.

## First Principles: Understanding SSE Connection Lifecycle

Before diving into reconnection, let's understand the basic SSE lifecycle:

```javascript
// Basic SSE connection on the server side
const express = require('express');
const app = express();

app.get('/events', (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  
    // Send initial connection message
    res.write('data: Connected to server\n\n');
  
    // Keep connection alive with periodic heartbeat
    const heartbeat = setInterval(() => {
        res.write('data: heartbeat\n\n');
    }, 30000);
  
    // Clean up when client disconnects
    req.on('close', () => {
        clearInterval(heartbeat);
    });
});
```

This basic setup establishes an SSE connection, but it doesn't handle reconnection gracefully.

## The Last-Event-ID Mechanism

The foundation of reconnection in SSE is the `Last-Event-ID` header. Here's how it works:

> When a connection breaks, the browser automatically sends a `Last-Event-ID` header with the ID of the last event it received. The server can use this to resume from where the client left off.

Let's implement this step by step:

```javascript
// Server-side implementation with Last-Event-ID
app.get('/events', (req, res) => {
    // Get last event ID from client
    const lastEventId = req.headers['last-event-id'];
  
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  
    // Send missed events if reconnecting
    if (lastEventId) {
        sendMissedEvents(res, lastEventId);
    }
  
    // Send confirmation
    res.write(`data: Reconnected from event ${lastEventId || 'beginning'}\n\n`);
});

function sendMissedEvents(res, lastEventId) {
    // In a real application, you'd fetch from a database or cache
    const missedEvents = getEventsAfter(lastEventId);
  
    missedEvents.forEach(event => {
        res.write(`id: ${event.id}\n`);
        res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    });
}
```

> The key insight here is that each event must have a unique ID that allows the server to identify where the client left off.

## Pattern 1: Automatic Browser Reconnection

The simplest reconnection pattern is letting the browser handle it automatically:

```javascript
// Client-side: Automatic reconnection
const eventSource = new EventSource('/events');

// Browser automatically reconnects with Last-Event-ID header
eventSource.onmessage = (event) => {
    console.log('Received:', event.data);
};

eventSource.onerror = (error) => {
    console.log('Connection error, browser will retry automatically');
    // Browser automatically attempts reconnection
};
```

This works out of the box, but you have limited control over the reconnection behavior.

## Pattern 2: Custom Reconnection with Exponential Backoff

For more control, implement custom reconnection logic:

```javascript
// Client-side: Custom reconnection with backoff
class SSEManager {
    constructor(url) {
        this.url = url;
        this.eventSource = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.connect();
    }
  
    connect() {
        try {
            this.eventSource = new EventSource(this.url);
            this.setupEventHandlers();
        } catch (error) {
            this.handleReconnect();
        }
    }
  
    setupEventHandlers() {
        this.eventSource.onopen = () => {
            console.log('Connected to SSE');
            // Reset reconnection parameters on successful connection
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000;
        };
      
        this.eventSource.onmessage = (event) => {
            console.log('Message received:', event.data);
            // Process the message here
        };
      
        this.eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            this.eventSource.close();
            this.handleReconnect();
        };
    }
  
    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }
      
        this.reconnectAttempts++;
      
        // Exponential backoff with jitter
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        const jitter = Math.random() * 1000; // Add randomness
        const finalDelay = delay + jitter;
      
        console.log(`Reconnecting in ${finalDelay}ms (attempt ${this.reconnectAttempts})`);
      
        setTimeout(() => {
            this.connect();
        }, finalDelay);
    }
  
    close() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}
```

> Exponential backoff is crucial to prevent overwhelming the server with reconnection attempts during outages. We also add "jitter" (randomness) to prevent all clients from reconnecting simultaneously.

## Pattern 3: Persistent Event Store for Reliable Reconnection

For mission-critical applications, implement a persistent event store:

```javascript
// Server-side: Event store pattern
class EventStore {
    constructor() {
        this.events = new Map(); // In production, use Redis or a database
        this.eventId = 0;
    }
  
    addEvent(data) {
        this.eventId++;
        const event = {
            id: this.eventId,
            data: data,
            timestamp: Date.now()
        };
        this.events.set(this.eventId, event);
      
        // Clean up old events (optional)
        this.cleanupOldEvents();
      
        return event;
    }
  
    getEventsAfter(lastEventId) {
        const events = [];
        const startId = lastEventId ? parseInt(lastEventId) + 1 : 1;
      
        for (let i = startId; i <= this.eventId; i++) {
            if (this.events.has(i)) {
                events.push(this.events.get(i));
            }
        }
      
        return events;
    }
  
    cleanupOldEvents() {
        // Keep only last 1000 events
        if (this.events.size > 1000) {
            const sortedKeys = Array.from(this.events.keys()).sort((a, b) => a - b);
            const keysToDelete = sortedKeys.slice(0, this.events.size - 1000);
            keysToDelete.forEach(key => this.events.delete(key));
        }
    }
}

// Usage in SSE handler
const eventStore = new EventStore();

app.get('/events', (req, res) => {
    const lastEventId = req.headers['last-event-id'];
  
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  
    // Send missed events
    if (lastEventId) {
        const missedEvents = eventStore.getEventsAfter(lastEventId);
        missedEvents.forEach(event => {
            res.write(`id: ${event.id}\n`);
            res.write(`data: ${JSON.stringify(event.data)}\n\n`);
        });
    }
  
    // Keep track of this connection
    const connectionId = Date.now();
    connections.set(connectionId, res);
  
    // Clean up on disconnect
    req.on('close', () => {
        connections.delete(connectionId);
    });
});

// Function to broadcast events
function broadcastEvent(data) {
    const event = eventStore.addEvent(data);
  
    connections.forEach((res) => {
        res.write(`id: ${event.id}\n`);
        res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    });
}
```

## Pattern 4: Connection Quality Detection

Implement smart reconnection based on connection quality:

```javascript
// Client-side: Connection quality monitoring
class SmartSSEManager {
    constructor(url) {
        this.url = url;
        this.connectionQuality = 'unknown';
        this.latencyHistory = [];
        this.connect();
    }
  
    connect() {
        this.eventSource = new EventSource(this.url);
        this.setupEventHandlers();
        this.setupConnectionMonitoring();
    }
  
    setupConnectionMonitoring() {
        // Send periodic ping messages
        this.pingInterval = setInterval(() => {
            this.ping();
        }, 5000);
    }
  
    ping() {
        const pingStart = Date.now();
        const pingId = Math.random().toString(36);
      
        // Send ping message through a separate endpoint
        fetch(`/ping?id=${pingId}`)
            .then(response => response.text())
            .then(data => {
                if (data === pingId) {
                    const latency = Date.now() - pingStart;
                    this.updateConnectionQuality(latency);
                }
            })
            .catch(error => {
                console.error('Ping failed:', error);
                this.connectionQuality = 'poor';
            });
    }
  
    updateConnectionQuality(latency) {
        this.latencyHistory.push(latency);
      
        // Keep only last 10 measurements
        if (this.latencyHistory.length > 10) {
            this.latencyHistory.shift();
        }
      
        // Calculate average latency
        const avgLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
      
        // Determine connection quality
        if (avgLatency < 100) {
            this.connectionQuality = 'excellent';
        } else if (avgLatency < 300) {
            this.connectionQuality = 'good';
        } else if (avgLatency < 1000) {
            this.connectionQuality = 'fair';
        } else {
            this.connectionQuality = 'poor';
        }
      
        // Adjust reconnection strategy based on quality
        this.adjustReconnectionStrategy();
    }
  
    adjustReconnectionStrategy() {
        switch (this.connectionQuality) {
            case 'excellent':
            case 'good':
                this.reconnectDelay = 1000;
                this.maxReconnectAttempts = 10;
                break;
            case 'fair':
                this.reconnectDelay = 3000;
                this.maxReconnectAttempts = 5;
                break;
            case 'poor':
                this.reconnectDelay = 10000;
                this.maxReconnectAttempts = 3;
                break;
        }
    }
}
```

## Pattern 5: Graceful Degradation

Implement fallback mechanisms for when SSE isn't working:

```javascript
// Client-side: Graceful degradation
class RobustSSEManager {
    constructor(url) {
        this.url = url;
        this.fallbackToPolling = false;
        this.connect();
    }
  
    connect() {
        if (this.fallbackToPolling) {
            this.startPolling();
        } else {
            this.startSSE();
        }
    }
  
    startSSE() {
        this.eventSource = new EventSource(this.url);
      
        this.eventSource.onopen = () => {
            console.log('SSE connected successfully');
            this.fallbackToPolling = false;
        };
      
        this.eventSource.onerror = (error) => {
            console.error('SSE error:', error);
          
            // Check if we should fallback to polling
            if (this.reconnectAttempts > 3) {
                console.log('Falling back to polling');
                this.fallbackToPolling = true;
                this.eventSource.close();
                this.startPolling();
            }
        };
    }
  
    startPolling() {
        let lastEventId = localStorage.getItem('lastEventId') || '0';
      
        this.pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(`/poll?lastEventId=${lastEventId}`);
                const events = await response.json();
              
                events.forEach(event => {
                    this.handleEvent(event);
                    lastEventId = event.id;
                    localStorage.setItem('lastEventId', lastEventId);
                });
              
                // Try to upgrade back to SSE periodically
                if (this.pollingAttempts % 10 === 0) {
                    this.tryUpgradeToSSE();
                }
              
                this.pollingAttempts++;
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 5000);
    }
  
    tryUpgradeToSSE() {
        console.log('Attempting to upgrade to SSE');
        clearInterval(this.pollingInterval);
        this.fallbackToPolling = false;
        this.startSSE();
    }
}
```

## Complete Production-Ready Implementation

Here's a comprehensive implementation combining all patterns:

```javascript
// server.js - Complete SSE server implementation
const express = require('express');
const Redis = require('ioredis');
const app = express();

// Redis for persistent event storage
const redis = new Redis();

class SSEServer {
    constructor() {
        this.connections = new Map();
        this.eventId = 0;
    }
  
    async addEvent(data) {
        this.eventId++;
        const event = {
            id: this.eventId,
            data: data,
            timestamp: Date.now()
        };
      
        // Store in Redis for persistence
        await redis.set(`event:${this.eventId}`, JSON.stringify(event));
        await redis.expire(`event:${this.eventId}`, 3600); // 1 hour TTL
      
        // Broadcast to all connected clients
        this.broadcast(event);
      
        return event;
    }
  
    async getEventsAfter(lastEventId) {
        const events = [];
        const startId = lastEventId ? parseInt(lastEventId) + 1 : Math.max(1, this.eventId - 100);
      
        for (let i = startId; i <= this.eventId; i++) {
            const eventData = await redis.get(`event:${i}`);
            if (eventData) {
                events.push(JSON.parse(eventData));
            }
        }
      
        return events;
    }
  
    broadcast(event) {
        const message = `id: ${event.id}\ndata: ${JSON.stringify(event.data)}\n\n`;
      
        this.connections.forEach((connection) => {
            try {
                connection.write(message);
            } catch (error) {
                console.error('Error broadcasting to connection:', error);
            }
        });
    }
  
    addConnection(id, res) {
        this.connections.set(id, res);
      
        // Send heartbeat to keep connection alive
        const heartbeat = setInterval(() => {
            try {
                res.write(':heartbeat\n\n');
            } catch (error) {
                this.removeConnection(id);
            }
        }, 30000);
      
        // Store heartbeat ID for cleanup
        res.heartbeatId = heartbeat;
    }
  
    removeConnection(id) {
        const connection = this.connections.get(id);
        if (connection && connection.heartbeatId) {
            clearInterval(connection.heartbeatId);
        }
        this.connections.delete(id);
    }
}

const sseServer = new SSEServer();

// SSE endpoint
app.get('/events', async (req, res) => {
    const lastEventId = req.headers['last-event-id'];
    const connectionId = Date.now() + Math.random();
  
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    try {
        // Send missed events
        if (lastEventId) {
            const missedEvents = await sseServer.getEventsAfter(lastEventId);
            missedEvents.forEach(event => {
                res.write(`id: ${event.id}\n`);
                res.write(`data: ${JSON.stringify(event.data)}\n\n`);
            });
        }
      
        // Add to active connections
        sseServer.addConnection(connectionId, res);
      
        // Send connection confirmation
        res.write(`data: Connected (${lastEventId ? 'resumed' : 'new'})\n\n`);
      
        // Handle client disconnect
        req.on('close', () => {
            sseServer.removeConnection(connectionId);
        });
      
    } catch (error) {
        console.error('SSE endpoint error:', error);
        res.status(500).end();
    }
});

// Ping endpoint for connection quality monitoring
app.get('/ping', (req, res) => {
    res.send(req.query.id);
});

// Polling fallback endpoint
app.get('/poll', async (req, res) => {
    try {
        const lastEventId = req.query.lastEventId || '0';
        const events = await sseServer.getEventsAfter(lastEventId);
        res.json(events);
    } catch (error) {
        console.error('Polling endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('SSE server running on port 3000');
});
```

## Best Practices and Considerations

> **Connection Management** : Always maintain a registry of active connections and clean up properly when connections close.

> **Event Persistence** : Store events temporarily to handle reconnections gracefully. Use Redis, a database, or an in-memory store with TTL.

> **Exponential Backoff** : Implement exponential backoff with jitter to prevent server overload during mass reconnections.

> **Heartbeats** : Send periodic heartbeat messages to detect and close stale connections.

> **Graceful Degradation** : Have fallback mechanisms like polling for when SSE doesn't work reliably.

> **Connection Quality Monitoring** : Adjust reconnection strategies based on observed connection quality.

> **Resource Cleanup** : Always clean up resources (timers, connections) when a client disconnects.

## Testing Reconnection Behavior

To test your reconnection implementation:

1. **Network Interruption Test** : Disable and re-enable network connection
2. **Server Restart Test** : Restart the server and verify clients reconnect
3. **Load Test** : Simulate many clients reconnecting simultaneously
4. **Latency Test** : Introduce artificial delays to test quality adaptation

## Conclusion

Proper reconnection handling in SSE requires careful attention to several patterns: automatic browser reconnection, custom reconnection with backoff, persistent event storage, connection quality monitoring, and graceful degradation. By combining these patterns, you can build robust real-time applications that maintain connectivity even under challenging network conditions.

The key is to start simple and add complexity as needed, always keeping user experience and server resource usage in mind.
