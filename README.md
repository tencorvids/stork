# Stork Template

This is an opinionated template for creating scalable web applications using a monorepo architecture without any fancy tooling, just pnpm.

## Getting Started

1. Clone the repository.
1b. Run nix-shell to enter a development environment if using nix.
1c. Run `docker compose up` to start the database in `/infra`.
3. Run `pnpm install` to install dependencies.

## Suggestions

- Follow our error handling patterns, using the `tc` util function and neverthrow results.
- Create new schemas in the `db` package and follow the pattern of type creation, schema validation, and timestamps.
- Add more shadcn components to the `ui` package manually, as needed.
- Run `find . -type f \( -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.md" -o -name "*.yml" -o -name "*.yaml" \) -not -path "./node_modules/*" -not -path "./.git/*" -exec sed -i 's/@stork/@NEW_NAMESPACE/g; s/\bstork\b/NEW_NAMESPACE/g' {} +` to replace the namespace, replacing `NEW_NAMESPACE` with your desired name.

## Further Work

- Add a CI/CD pipeline.
    - Release versioning.
    - Dependency updates (dependabot).
- Add changesets for versioning.
