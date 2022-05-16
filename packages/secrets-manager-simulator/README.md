# serverless-offline-secrets-manager-simulator

This plugin exposes a secrets manager compatible API on a configurable port whenever
[Serverless Offline](https://github.com/dherault/serverless-offline) is started. Secrets are stored in-memory and 
will be lost when the server is stopped

# Supported API Calls
* [CreateSecret](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_CreateSecret.html)
* [GetSecretValue](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html)
* [DeleteSecret](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_DeleteSecret.html)

# Installation

```bash
npm install serverless-offline-secrets-manager-simulator
```

In your serverless.yml:
```yaml
plugins:
  - serverless-offline-secrets-manager-simulator
```

# Configuration
```yaml
custom:
  secrets-manager-simulator:
      port: 8007 # Optional - port to listen on. Defaults to 8007
      enableDebugEndpoint: true # Optional. Defaults to true. If false, the /list endpoint will not be available 
      secretsFile: /tmp/secrets.json # Optional. If specified, the plugin will persist secrets between runs to the specified json file 
      secrets: # Optional. List of key-value pairs to seed the secret manager with on startup
        - key: Secret1
          value: I-Am-A-Secret
        - key: Secret2
          value: I-Am-Another-Secret
```

# Usage
Simply send appropriately formatted POST requests to `http://127.0.0.1:[PORT]` where PORT is specified in the configuration
(or use the default 8007)

When using the AWS sdk, create your client with a custom endpoint specified:
```typescript
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager"

const client = new SecretsManagerClient({ endpoint: "http://127.0.0.1:8007" })
```

The plugin provides a debug endpoint at `/list` which will list all secrets currently contained within the store

 