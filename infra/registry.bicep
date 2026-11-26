// Step 1 of the deploy: the container registry and the identity the apps use to pull from it.
// Deployed before the images are pushed (main.bicep needs the images to exist).

@description('Azure region for every resource.')
param location string = resourceGroup().location

@description('Globally unique, alphanumeric registry name.')
param registryName string = 'acr${uniqueString(resourceGroup().id)}'

@description('User-assigned identity shared by the container apps to pull images.')
param identityName string = 'id-barbershop-apps'

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
}

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}

// Built-in AcrPull role.
var acrPullRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')

// Created here (not in main.bicep) so the role assignment has time to propagate
// while the images are built, before any container app tries to pull.
resource acrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, identity.id, acrPullRoleId)
  scope: registry
  properties: {
    roleDefinitionId: acrPullRoleId
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

output registryName string = registry.name
output loginServer string = registry.properties.loginServer
output identityName string = identity.name
