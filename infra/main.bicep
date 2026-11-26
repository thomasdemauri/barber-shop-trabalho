// Step 2 of the deploy: database, message broker and the four container apps.
// Mirrors docker-compose.yml; the only differences are managed Postgres and Azure networking.

@description('Azure region for every resource.')
param location string = resourceGroup().location

@description('Registry created by registry.bicep.')
param registryName string

@description('Identity created by registry.bicep (has AcrPull on the registry).')
param identityName string = 'id-barbershop-apps'

@description('Image tag to deploy (the commit SHA in CI).')
param imageTag string

// ---------- secrets (GitHub secrets -> workflow -> here) ----------
@secure()
param postgresAdminPassword string

@secure()
param jwtSecret string

@secure()
param rabbitmqPassword string

@secure()
@description('Only needed when emailProvider is brevo.')
param brevoApiKey string = ''

// ---------- plain settings ----------
param postgresAdminLogin string = 'barbershop'
param postgresDatabaseName string = 'barbershop'
param rabbitmqUser string = 'barbershop'

@allowed(['memory', 'brevo'])
param emailProvider string = 'memory'
param emailFrom string = 'Navalha de Ouro <nao-responda@barbearia.test>'
param shopName string = 'Navalha de Ouro'
param shopTimeZone string = 'America/Sao_Paulo'
param slotIntervalMinutes string = '30'

@allowed(['true', 'false'])
@description('Seed the Brazilian demo clients and appointments.')
param seedDemoData string = 'true'

var suffix = uniqueString(resourceGroup().id)

// ---------- existing resources from registry.bicep ----------
resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: registryName
}

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: identityName
}

var backendImage = '${registry.properties.loginServer}/barbershop-backend:${imageTag}'
var frontendImage = '${registry.properties.loginServer}/barbershop-frontend:${imageTag}'

var registries = [
  {
    server: registry.properties.loginServer
    identity: identity.id
  }
]

var appIdentity = {
  type: 'UserAssigned'
  userAssignedIdentities: {
    '${identity.id}': {}
  }
}

// ---------- logs + environment ----------
resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-barbershop-${suffix}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource environment 'Microsoft.App/managedEnvironments@2026-07-01' = {
  name: 'cae-barbershop'
  location: location
  properties: {
    // Azure now defaults new environments to 'Express', which rejects TCP ingress (RabbitMQ needs it).
    environmentMode: 'WorkloadProfiles'
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
  }
}

// ---------- PostgreSQL (managed) ----------
resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: 'psql-barbershop-${suffix}'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: postgresAdminLogin
    administratorLoginPassword: postgresAdminPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: postgres
  name: postgresDatabaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Container Apps (consumption) has no fixed outbound IP, so allow Azure-hosted clients.
// Access still requires the admin password over TLS.
resource postgresAllowAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: postgres
  name: 'AllowAllAzureServicesAndResourcesWithinAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// RabbitMQ and the notification worker run as extra containers in the backend app.
// Containers of one app share localhost, so the broker needs no TCP ingress
// (internal TCP ingress does not route without a custom VNet).
var rabbitmqUrl = 'amqp://${rabbitmqUser}:${uriComponent(rabbitmqPassword)}@localhost:5672'
var databaseUrl = 'postgresql://${postgresAdminLogin}:${uriComponent(postgresAdminPassword)}@${postgres.properties.fullyQualifiedDomainName}:5432/${postgresDatabaseName}?sslmode=require'

// The public URL is known up front: <app name>.<environment default domain>.
var frontendUrl = 'https://frontend.${environment.properties.defaultDomain}'

// ---------- Backend app: API + RabbitMQ + notification worker ----------
resource backend 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'backend'
  location: location
  identity: appIdentity
  dependsOn: [
    postgresDatabase
    postgresAllowAzure
  ]
  properties: {
    environmentId: environment.id
    configuration: {
      ingress: {
        external: false
        targetPort: 3000
        transport: 'http'
        // Nginx proxies over plain HTTP inside the environment.
        allowInsecure: true
      }
      registries: registries
      secrets: [
        {
          name: 'database-url'
          value: databaseUrl
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
        {
          name: 'rabbitmq-url'
          value: rabbitmqUrl
        }
        {
          name: 'rabbitmq-password'
          value: rabbitmqPassword
        }
        {
          // Container Apps rejects empty secret values.
          name: 'brevo-api-key'
          value: empty(brevoApiKey) ? 'not-set' : brevoApiKey
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: backendImage
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT', value: '3000' }
            { name: 'DATABASE_URL', secretRef: 'database-url' }
            { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
            { name: 'RABBITMQ_URL', secretRef: 'rabbitmq-url' }
            { name: 'CORS_ORIGIN', value: frontendUrl }
            { name: 'SHOP_TIMEZONE', value: shopTimeZone }
            { name: 'SLOT_INTERVAL_MINUTES', value: slotIntervalMinutes }
            { name: 'SEED_DEMO_DATA', value: seedDemoData }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
        {
          // No persistent volume: messages still queued when the broker restarts are lost.
          name: 'rabbitmq'
          image: 'docker.io/library/rabbitmq:3-management-alpine'
          env: [
            { name: 'RABBITMQ_DEFAULT_USER', value: rabbitmqUser }
            { name: 'RABBITMQ_DEFAULT_PASS', secretRef: 'rabbitmq-password' }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
        {
          // Same image as the API, different entrypoint. Exits (and is restarted)
          // until the broker accepts connections.
          name: 'notification-worker'
          image: backendImage
          command: ['node', 'dist/src/worker.js']
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'RABBITMQ_URL', secretRef: 'rabbitmq-url' }
            { name: 'EMAIL_PROVIDER', value: emailProvider }
            { name: 'EMAIL_FROM', value: emailFrom }
            { name: 'BREVO_API_KEY', secretRef: 'brevo-api-key' }
            { name: 'SHOP_NAME', value: shopName }
            { name: 'SHOP_TIMEZONE', value: shopTimeZone }
            { name: 'FRONTEND_URL', value: frontendUrl }
            { name: 'NOTIFICATION_MAX_ATTEMPTS', value: '5' }
            { name: 'NOTIFICATION_RETRY_DELAY_MS', value: '2000' }
          ]
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      // One replica: the API runs `prisma migrate deploy` + seed on start, and the broker is single-node.
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

// ---------- Frontend (public; Nginx serves the SPA and proxies /api) ----------
resource frontend 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'frontend'
  location: location
  identity: appIdentity
  properties: {
    environmentId: environment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'http'
      }
      registries: registries
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: frontendImage
          env: [
            { name: 'BACKEND_INTERNAL_URL', value: 'http://${backend.properties.configuration.ingress.fqdn}' }
          ]
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

output frontendUrl string = 'https://${frontend.properties.configuration.ingress.fqdn}'
output postgresHost string = postgres.properties.fullyQualifiedDomainName
