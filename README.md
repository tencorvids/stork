# Stork Template

This is an opinionated template for creating scalable web applications using a monorepo architecture without any fancy tooling, just pnpm.

## Getting Started

1. Clone the repository.
2. Set up the environment:
   - Run nix-shell to enter a development environment if using nix.
   - Run `docker compose up` to start the database in `/infra`.
3. Run `pnpm install` to install dependencies.

## Suggestions

- Follow our error handling patterns, using the `tc` util function and neverthrow results.
- Create new schemas in the `db` package and follow the pattern of type creation, schema validation, and timestamps.
- Add more shadcn components to the `ui` package manually, as needed.
- To replace the namespace throughout the project, replace `NEW_NAMESPACE` with your desired name and run:

```bash
find . -type f \( -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.md" -o -name "*.yml" -o -name "*.yaml" -o -name "*.css" \) -not -path "./node_modules/*" -not -path "./.git/*" -exec sed -i 's/@stork/@NEW_NAMESPACE/g; s/\bstork\b/NEW_NAMESPACE/g' {} +
```

## Further Work

- Add a CI/CD pipeline.
    - Release versioning.
    - Dependency updates (dependabot).
- Add changesets for versioning.
- Add theme switcher (already setup themes).
