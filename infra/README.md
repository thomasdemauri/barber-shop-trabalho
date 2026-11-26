# Azure deployment

Every push to `main` that passes the tests is deployed to Azure Container Apps by the `deploy` job in `.github/workflows/ci.yml`:

1. `registry.bicep`: Azure Container Registry plus a managed identity with `AcrPull` on it.
2. The backend and frontend images are built and pushed, tagged with the commit SHA.
3. `main.bicep` deploys these resources:

| docker-compose service | Azure resource |
| --- | --- |
| `postgres` | Azure Database for PostgreSQL Flexible Server (B1ms, TLS required) |
| `rabbitmq` | Container app `rabbitmq`, internal TCP ingress on port 5672 |
| `backend` | Container app `backend`, internal HTTP ingress (not public) |
| `notification-worker` | Container app `notification-worker`, same image, no ingress |
| `frontend` | Container app `frontend`, the only public URL; Nginx proxies `/api` to the backend |

Local development is unchanged: `docker compose up` still runs everything, including its own Postgres.

## One-time setup

```bash
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
RG=rg-barbershop
LOCATION=brazilsouth          # any region where Postgres Flexible B1ms is available to you
REPO=<github-user>/<repo>

az group create -n $RG -l $LOCATION

# App registration that GitHub Actions logs in as (OIDC, no secret)
APP_ID=$(az ad app create --display-name gh-barbershop-deploy --query appId -o tsv)
az ad sp create --id $APP_ID
az ad app federated-credential create --id $APP_ID --parameters "{
  \"name\": \"github-production\",
  \"issuer\": \"https://token.actions.githubusercontent.com\",
  \"subject\": \"repo:$REPO:environment:production\",
  \"audiences\": [\"api://AzureADTokenExchange\"]
}"

# Contributor creates resources and pushes images; User Access Administrator lets
# registry.bicep grant AcrPull to the apps' identity.
SCOPE=/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG
az role assignment create --assignee $APP_ID --role Contributor --scope $SCOPE
az role assignment create --assignee $APP_ID --role "User Access Administrator" --scope $SCOPE

# Resource providers used by the templates (no-op if already registered)
for ns in Microsoft.App Microsoft.OperationalInsights Microsoft.ContainerRegistry Microsoft.DBforPostgreSQL Microsoft.ManagedIdentity; do
  az provider register -n $ns
done

echo "AZURE_CLIENT_ID=$APP_ID"
echo "AZURE_TENANT_ID=$(az account show --query tenantId -o tsv)"
echo "AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
```

## GitHub configuration

Create an environment named **`production`** (Settings → Environments). Add the values below to it; repository-level values also work.

**Secrets**

| Name | Value |
| --- | --- |
| `AZURE_CLIENT_ID` | From the setup above |
| `AZURE_TENANT_ID` | From the setup above |
| `AZURE_SUBSCRIPTION_ID` | From the setup above |
| `POSTGRES_ADMIN_PASSWORD` | 8–128 characters, using three of: uppercase, lowercase, digits, symbols |
| `JWT_SECRET` | Long random string, e.g. `openssl rand -base64 48` |
| `RABBITMQ_PASSWORD` | Random string |
| `BREVO_API_KEY` | Optional; only needed when `EMAIL_PROVIDER=brevo` |

**Variables**

| Name | Default | Notes |
| --- | --- | --- |
| `AZURE_RESOURCE_GROUP` | (required) | e.g. `rg-barbershop` |
| `EMAIL_PROVIDER` | `memory` | `brevo` for real e-mails |
| `EMAIL_FROM` | `Navalha de Ouro <nao-responda@barbearia.test>` | Must be a verified Brevo sender when using Brevo |
| `SEED_DEMO_DATA` | `true` | `false` for an empty agenda |

The deployed URL appears in the job summary.

## Notes

- **Cost:** about US$13/month for Postgres B1ms, about US$5/month for ACR Basic, plus Container Apps usage. Delete the resource group when you no longer need it: `az group delete -n rg-barbershop`.
- **RabbitMQ has no persistent volume.** Messages still queued when the broker restarts are lost; appointments are stored in Postgres.
- **Migrations** run when the backend starts (`prisma migrate deploy`), so the backend runs a single replica.
- **Postgres firewall:** the server accepts connections from Azure-hosted services, because Container Apps on the consumption plan has no fixed outbound IP. Connections still require TLS and the admin password.
