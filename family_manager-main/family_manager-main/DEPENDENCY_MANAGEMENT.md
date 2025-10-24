# Dependency Management Guide

This document explains the dependency management strategy for the BaseFam project and provides guidelines for maintaining and updating dependencies.

## Table of Contents

- [Overview](#overview)
- [Current Dependencies](#current-dependencies)
- [Version Strategy](#version-strategy)
- [Automated Updates](#automated-updates)
- [Manual Update Process](#manual-update-process)
- [Critical Dependency Groups](#critical-dependency-groups)
- [Troubleshooting](#troubleshooting)

## Overview

BaseFam uses a carefully managed set of dependencies that are all compatible with React 19. All peer dependencies have been resolved to ensure smooth installation and operation.

### Key Principles

1. **Stability First**: We prefer stable, well-tested versions over bleeding edge
2. **Compatibility**: All dependencies must be compatible with React 19 and Next.js 15
3. **Security**: Security patches are applied as soon as they're available
4. **Testing**: All dependency updates must pass CI/CD checks before merging

## Current Dependencies

### Production Dependencies

| Package | Version | Purpose | React 19 Compatible |
|---------|---------|---------|---------------------|
| `@coinbase/onchainkit` | ^1.1.1 | Coinbase blockchain toolkit | ✅ Yes (^19) |
| `@tanstack/react-query` | ^5.56.0 | Data fetching and caching | ✅ Yes (>=5.0.0) |
| `next` | ^15.5.6 | React framework | ✅ Yes (^19.0.0) |
| `react` | ^19.2.0 | UI library | ✅ Native |
| `react-dom` | ^19.2.0 | React DOM renderer | ✅ Native |
| `viem` | ^2.27.0 | Ethereum TypeScript interface | ✅ Yes (2.x) |
| `wagmi` | ^2.18.0 | React Hooks for Ethereum | ✅ Yes (>=18) |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/node` | ^22.14.0 | Node.js type definitions |
| `@types/react` | ^19.2.0 | React type definitions |
| `@types/react-dom` | ^19.2.0 | React DOM type definitions |
| `@vitest/ui` | ^4.0.3 | Vitest UI for testing |
| `autoprefixer` | ^10.4.0 | CSS vendor prefixing |
| `eslint` | ^8.57.0 | Code linting |
| `eslint-config-next` | ^15.5.6 | Next.js ESLint config |
| `postcss` | ^8.4.0 | CSS transformations |
| `tailwindcss` | ^3.4.0 | Utility-first CSS |
| `typescript` | ~5.8.2 | TypeScript compiler |
| `vitest` | ^4.0.3 | Unit testing framework |

## Version Strategy

### Semantic Versioning

We use semantic versioning (semver) with the following range strategies:

- **Caret (`^`)**: Used for most dependencies
  - Allows patch and minor updates
  - Example: `^1.2.3` allows `1.2.4`, `1.3.0`, but not `2.0.0`
  - Provides automatic security and feature updates while preventing breaking changes

- **Tilde (`~`)**: Used for TypeScript
  - Allows only patch updates
  - Example: `~5.8.2` allows `5.8.3` but not `5.9.0`
  - Provides maximum stability for the compiler

### Why React 19?

React 19 was chosen for this project because:

1. **Latest Features**: Access to React's newest capabilities
2. **Performance**: Improved rendering performance and optimization
3. **Type Safety**: Better TypeScript integration
4. **Future-Proof**: Aligns with the ecosystem's direction

### Dependency Compatibility Matrix

All dependencies have been verified for React 19 compatibility:

```
React 19.2.0 ──┬── Next.js 15.5.6 ✅
               ├── @coinbase/onchainkit 1.1.1 ✅
               ├── wagmi 2.18.0 ✅
               ├── @tanstack/react-query 5.56.0 ✅
               └── @types/react 19.2.0 ✅

Viem 2.27.0 ───┬── wagmi 2.18.0 ✅
               └── @coinbase/onchainkit 1.1.1 ✅

Wagmi 2.18.0 ──── @coinbase/onchainkit 1.1.1 ✅
```

## Automated Updates

This project provides two options for automated dependency updates. **Choose one**, not both:

### Option 1: Renovate (Recommended)

Renovate is configured in `renovate.json` with:

- **Grouped Updates**: Related packages updated together
- **Scheduled Updates**: Weekly on Mondays at 5 AM UTC
- **Smart Merging**: Automatic PR creation with compatibility checks
- **Vulnerability Alerts**: Immediate security update notifications

**To enable Renovate:**

1. Install the [Renovate GitHub App](https://github.com/apps/renovate)
2. Configure repository access
3. Renovate will automatically use the `renovate.json` configuration

### Option 2: Dependabot

Dependabot is configured in `.github/dependabot.yml` with:

- **Grouped Updates**: Similar grouping strategy to Renovate
- **Scheduled Updates**: Weekly on Mondays at 5 AM UTC
- **Native GitHub Integration**: No external app needed

**To enable Dependabot:**

1. Go to repository Settings
2. Navigate to Security & analysis
3. Enable Dependabot version updates
4. Dependabot will use the `.github/dependabot.yml` configuration

### Comparison: Renovate vs Dependabot

| Feature | Renovate | Dependabot |
|---------|----------|------------|
| Grouping | Advanced | Basic |
| Scheduling | Flexible | Fixed intervals |
| Auto-merge | Yes | Limited |
| Lock file maintenance | Yes | No |
| Configuration | More options | Simpler |
| GitHub Integration | App required | Native |

**Recommendation**: Use Renovate for more control and features, or Dependabot for simpler native GitHub integration.

## Manual Update Process

When manually updating dependencies:

### 1. Check for Updates

```bash
# See all outdated packages
npm outdated

# Check specific package versions
npm view <package-name> versions
```

### 2. Review Changelogs

Always review changelogs before updating:

- **@coinbase/onchainkit**: https://github.com/coinbase/onchainkit/releases
- **Next.js**: https://github.com/vercel/next.js/releases
- **React**: https://react.dev/blog
- **wagmi**: https://wagmi.sh/react/guides/migrate-from-v1-to-v2
- **viem**: https://viem.sh/docs/migration-guide.html

### 3. Update Strategy

#### Patch Updates (e.g., 1.2.3 → 1.2.4)

Generally safe, can be applied with minimal testing:

```bash
npm update <package-name>
```

#### Minor Updates (e.g., 1.2.3 → 1.3.0)

New features, should be tested thoroughly:

```bash
npm install <package-name>@latest
npm run typecheck
npm run lint
npm run test
npm run build
```

#### Major Updates (e.g., 1.2.3 → 2.0.0)

Breaking changes, requires careful planning:

1. **Read the migration guide**
2. **Update one package at a time**
3. **Test extensively**:
   ```bash
   npm install <package-name>@latest
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   npm run dev  # Manual testing
   ```
4. **Update related packages** if needed
5. **Update documentation** to reflect changes

### 4. Testing Checklist

After any dependency update:

- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Development server runs (`npm run dev`)
- [ ] Key features work in browser:
  - [ ] Wallet connection
  - [ ] Contract interactions
  - [ ] UI rendering
  - [ ] Navigation

### 5. Commit Strategy

Use conventional commits for dependency updates:

```bash
# For patch/minor updates
git commit -m "chore(deps): update <package> to <version>"

# For major updates
git commit -m "chore(deps): upgrade <package> to <version>

BREAKING CHANGE: <description of breaking changes>
<migration steps if needed>"

# For security updates
git commit -m "fix(deps): update <package> to fix security vulnerability

Fixes: <CVE-ID or issue reference>"
```

## Critical Dependency Groups

### React Ecosystem

**Packages**: `react`, `react-dom`, `@types/react`, `@types/react-dom`

**Update Strategy**: Always update together to maintain version alignment.

```bash
npm install react@latest react-dom@latest @types/react@latest @types/react-dom@latest
```

**Considerations**:
- Major React updates can break the entire application
- Test thoroughly across all components
- Check for deprecation warnings in console

### Next.js Ecosystem

**Packages**: `next`, `eslint-config-next`

**Update Strategy**: Update together, verify Next.js changelog for breaking changes.

```bash
npm install next@latest eslint-config-next@latest
```

**Considerations**:
- Next.js updates can change App Router behavior
- Review middleware and route changes
- Check for new required configurations

### Blockchain Stack

**Packages**: `wagmi`, `viem`, `@coinbase/onchainkit`, `@tanstack/react-query`

**Update Strategy**: Check peer dependency compatibility before updating.

```bash
# Check compatibility first
npm view wagmi@latest peerDependencies
npm view viem@latest peerDependencies
npm view @coinbase/onchainkit@latest peerDependencies

# Then update if compatible
npm install wagmi@latest viem@latest @coinbase/onchainkit@latest
```

**Considerations**:
- These packages have strict version requirements
- Breaking changes can affect contract interactions
- Test wallet connections and transactions thoroughly

### TypeScript

**Package**: `typescript`

**Update Strategy**: Update cautiously, test extensively.

```bash
npm install typescript@latest
```

**Considerations**:
- New TypeScript versions can introduce stricter type checking
- May require code changes to satisfy new type requirements
- Can affect build times

## Troubleshooting

### Issue: Peer Dependency Conflicts After Update

**Symptoms**:
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer react@"^18.0.0" from package-x
```

**Solutions**:

1. **Check if newer version exists**:
   ```bash
   npm view <problematic-package> versions
   npm view <problematic-package>@latest peerDependencies
   ```

2. **Update the conflicting package**:
   ```bash
   npm install <problematic-package>@latest
   ```

3. **If no compatible version exists**, consider:
   - Finding an alternative package
   - Waiting for the package to update
   - Using `--legacy-peer-deps` as a temporary workaround (not recommended)

### Issue: Build Failures After Update

**Solution**:

1. Clear all caches:
   ```bash
   rm -rf node_modules .next package-lock.json
   npm install
   npm run build
   ```

2. Check for deprecation warnings in the build output

3. Review the changelog for breaking changes

### Issue: Type Errors After Update

**Solution**:

1. Update type definitions:
   ```bash
   npm install @types/node@latest @types/react@latest @types/react-dom@latest
   ```

2. Clear TypeScript cache:
   ```bash
   rm -rf .next
   npx tsc --noEmit
   ```

3. Check if your code uses deprecated types

### Issue: Lock File Conflicts

**Solution**:

1. Delete lock file and reinstall:
   ```bash
   rm package-lock.json
   npm install
   ```

2. If in a merge conflict:
   ```bash
   git checkout --theirs package-lock.json  # or --ours
   npm install
   git add package-lock.json
   ```

## Best Practices

1. **Update Regularly**: Weekly or bi-weekly updates are easier than large quarterly updates
2. **Read Changelogs**: Always review what's changing before updating
3. **Test Thoroughly**: Run all automated and manual tests after updates
4. **Update One at a Time**: When updating major versions, do one package at a time
5. **Keep Lock File**: Always commit `package-lock.json` for deterministic installs
6. **Document Breaking Changes**: Update this guide when making major dependency changes
7. **Monitor Security**: Enable GitHub security alerts for vulnerability notifications

## Resources

- [npm documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [Renovate documentation](https://docs.renovatebot.com/)
- [Dependabot documentation](https://docs.github.com/en/code-security/dependabot)
- [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Next.js upgrade guide](https://nextjs.org/docs/upgrading)
- [wagmi migration guides](https://wagmi.sh/react/guides/migrate-from-v1-to-v2)

## Questions or Issues?

If you encounter dependency issues not covered in this guide:

1. Check the [main README troubleshooting section](./README.md#troubleshooting)
2. Review existing GitHub issues
3. Create a new issue with:
   - The dependency causing the problem
   - Error messages
   - Steps to reproduce
   - Your Node and npm versions

---

Last updated: October 2024
