# serverless-offline-streams

This plugin provides support for event driven systems using [Serverless Offline](https://github.com/dherault/serverless-offline) 

# Supported Features
## SQS
* Binds to SQS compatible MQ instances. It is recommended to include an [ElasticMQ](https://github.com/softwaremill/elasticmq)
  instance as part of your test stack (see the [example](packages/serverless-offline-streams-example) for a sample 
  docker-compose file.
* Auto-create SQS queues from Resource definitions
* Create SQS queues via plugin configuration
* Auto-scan lambda function definitions and bind queues to appropriate handlers
* Resolve direct arn, Ref, Fn::Import and FN::GetAtt queue bindings
* Create, Delete and purge queues on stack start (configurable)
* Poll queues for new messages and invoke bound handlers
* Remove messages from queues on success
* Typescript
* SQS queue listeners
* DynamoDB Streams events
* DynamoDB Streams event filtering

## DynamoDB Streams
* Bridges the [DynamoDB Local](https://github.com/99x/serverless-dynamodb-local) plugin and [Serverless Offline](https://github.com/dherault/serverless-offline)
* Binds DynamoDB streams event mappings to the appropriate lambdas
* Supports [Event Filtering](https://aws.amazon.com/blogs/compute/filtering-event-sources-for-aws-lambda-functions/)

# Installation

```bash
npm install serverless-offline-streams
```

In your serverless.yml:
```yaml
plugins:
  - serverless-offline-streams
```

# Configuration
```yaml
custom:
  serverless-offline-streams:
    dynamodb:
      endpoint: http://localhost:8000 # Required - dynamodb local endpoint
      tableNames: # Optional. See below for explanation of table names mapping 
        tableKey1: tableName1
        tableKey2: tableName2
    sqs:
      enabled: false # Optional. Whether to activate SQS queue event mappings
      host: http://127.0.0.1:8050 # Required. Host & port of elasticmq instance  
      createQueuesFromResources: true # Optional. If true, will scan defined Resources for queues and create them according to the config
      removeExistingQueuesOnStart: true # Optional. If true, will remove all existing queues in elasticmq on startup
      purgeExistingQueuesOnStart: false # Optional. If true, will purge all existing queues in elasticmq on startup
      additionalQueues: # Optional. Additional queues to create on startup
        -  name: 'Queue1', # Queue name to bind handlers to
           aliases: # Aliases for the queue - Useful when binding to output variables in other stacks
             - "Queue1Alias1"
             - "Queue1Alias2"
           visibilityTimeout: 5 # Optional. Queue VisibilityTimeout
           delaySeconds: 5   # Optional. Queue DelaySeconds
      pollConfig: # Optional. See below for an explanation of how polling works
        strategy: backoff # Optional. Either backoff or fixed-interval
        drainQueues: false # Optional. Whether to keep retrieving messages from a queue until there are no messages, if a message is found
        messageBatchSize: 10 # Optional. How many messages to retrieve in each batch
        fixedIntervalMs: 5000 # Optional. Only applicable to fixed-interval strategy
        backOffType: double # Optional. Only applicable to backoff strategy. Either double or step
        minIntervalMs: 100 # Optional. Only applicable to backoff strategy
        maxIntervalMs: 5000 # Optional. Only applicable to backoff strategy
        intervalStepMs: 100 # Optional. Only applicable to backoff strategy with step backoffType
```

# SQS Configuration
## Polling
The plugin will poll all bound queues at regular intervals, based on its polling strategy (see below), attempting to 
retrieve **messageBatchSize** messages on each poll.

If at least one message is found on a queue, and **drainQueues** is _true_, then the plugin will continue to retrieve
messages until the queue is empty.

_**Warning:** If a queue receives a lot of messages and **drainQueues** is set to true, this may cause starvation of 
handling to the other queues, as the thread will be blocked attempting to drain the busier queue. It is better to allow 
a round robin approach where each poll interval will attempt to retrieve **messageBachSize** messages from each queue in 
turn._ 

### Polling Strategies
The plugin supports two polling strategies:

#### Backoff 
This is the default strategy. The plugin will first poll every **minIntervalMs** milliseconds. If no messages are 
received on _any_ queue, the polling interval will increase, up to **maxIntervalMs**. If a message is received, the 
polling will drop back down to **minIntervalMs** (on the basis that more messages are likely to follow)
 
The way in which the polling interval increases is determined by the **backoffType** property:
* _step_ - The polling interval will increase by **intervalStepMs** each time
* _double_ - The polling interval will increase by doubling each time (e.g. if **minIntervalMs** is 100, the next 
               interval will be 200, then 400, then 800 etc.)

#### Fixed Interval
The plugin will poll every **fixedIntervalMs**, regardless of whether messages are found or not

# DynamoDB Streams Configuration
## Table Names
* If you are using only string ARNs, the plugin will be able to extract the table names from the ARN.
* If you are using a Ref function, the plugin will scan your resources to locate the table
* However, if you are using a cross stack reference, you must provide a mapping in the `tableNames` configuration block 

The entry value should be the dynamo table name and the  key should be the name of the cross stack reference 
__after interpolation__. For example, given the following event mapping and having stage set to 'dev':

```yaml
handler: src/handler.handler
events:
- stream:
    arn: !ImportValue ${self:provider.stage}StreamArn
    type: dynamodb
    batchSize: 10
    startingPosition: TRIM_HORIZON
```

The import value key would resolve to "devStreamArn" so the tableNames block would be as follows:

```yaml
custom:
  serverless-offline-dynamodb-streams-handler:
      tableNames: 
        devStreamArn: my-dynamo-table
```

# Usage with Typescript
In order for the plugin to correctly locate your transpiled handlers, set the 'location' property of serverless-offline
This should be compatible with a number of transpilers that put transpiled code in a separate build directory (tested 
with the [serverless-esbuild plugin](https://github.com/floydspace/serverless-esbuild)) 

```yaml
custom:
  serverless-offline:
    location: .esbuild/.build
```

# Filter Patterns
See the [Filter Patterns Guide](src/dynamodb/filterPatterns/README.md)


# Future work:
* Supporting AWS EventBridge
