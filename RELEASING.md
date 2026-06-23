# Releasing & Deploying

**Production is the `main` branch.** Vercel is connected to this repo and deploys
automatically — there is no manual `vercel deploy` step in the normal flow.

## Standard workflow

1. **Branch** off `main` for any change and open a Pull Request.
   - Every branch / PR gets its own Vercel **preview** deployment automatically.
2. **Merge** the PR into `main`.
   - Vercel builds and deploys **production** from `main` automatically.
3. **Tag** the release on `main` with [SemVer](https://semver.org):

   ```bash
   # bump "version" in package.json to match, then:
   git tag -a vX.Y.Z -m "vX.Y.Z — short summary"
   git push origin main --follow-tags
   ```

   - `MAJOR` (`v2.0.0`) — breaking change / major rework.
   - `MINOR` (`v1.1.0`) — new feature, backwards compatible.
   - `PATCH` (`v1.0.1`) — fix only.

Do **not** ship production with ad-hoc `vercel --prod` from a feature branch;
push to `main` and let the Git integration deploy it.

## Production

- URL: <https://tempo-track-nu.vercel.app>
- Vercel project `tempo-track`, team `tmh-projects`.

## Rollback

Vercel Dashboard → the project → **Deployments** → pick a previous production
deployment → **Promote**. (Or `vercel rollback <url>`.) Previous deployments are
retained, so rollback is instant.

## Release history

- `v1.0.0` — pivot to **The Stablecoin Market Map** (752 companies; landscape +
  directory + per-company profiles).
- `stablytics-analytics-v1` — archived snapshot of the previous on-chain
  analytics app (also branch `archive/stablytics-analytics`).
