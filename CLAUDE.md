# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Backend for "Orígenes", a multi-branch (sucursal) inventory control system. Products are stocked in deposits belonging to branches, stock moves between branches via transfers, and low-stock alerts are computed per branch against a min/reorder threshold. As of the latest models, the same transfer mechanism also tracks branch-owned equipment (computers, TVs, etc.) as a separate inventory type alongside products.

This directory is its own git repository (`origin-backend` on GitHub), independent from the sibling `frontend/` repo. There is no root repo tying them together — run git commands from here, not from the parent directory.

## Commands

```bash
npm start                        # nodemon app.js — API at http://localhost:4000
```

There is no test suite (`npm test` is a placeholder that exits 1) and no lint script.

Required `.env` keys (see `config/database.js`, `helpers/generar-jwt.js`): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.

## Architecture

Plain layered Express app, no ORM migrations — `sequelize.sync({ alter: false })` is called on boot (`app.js`) so schema changes must be applied manually in MySQL.

- **Entry**: `app.js` wires global middleware (`cors`, JSON/urlencoded body parsing), mounts one router per resource under `/origin/api/<resource>`, then listens on `PORT` (default 4000).
- **Config/DB**: `config/database.js` builds the Sequelize instance from `.env`, dialect `mysql`, logging disabled.
- **Models**: one file per table under `models/` (`Product`, `Department`, `ProductType`, `ProductUse`, `Branch`, `Deposit`, `Inventory`, `Transfer`, `TransferDetail`, `Equipment`, `BranchEquipment`, `User`). Most have a soft-delete-style boolean `state` column instead of hard deletes, toggled via dedicated `change-state` endpoints/controllers rather than `DELETE`.
- **Associations**: all `hasMany`/`belongsTo` relations are centralized in `models/associations.js`, which re-exports every model. Controllers import models from `../models/associations` (not the individual model files) to get relations wired up — the sole exception is `authControllers.js`/`validar-token.js`, which import `User` directly since it has no associations.
- **Routes → Controllers**: each resource has a `routes/<x>Router.js` mounted in `app.js` and a matching `controllers/<x>Controllers.js`. Routes apply the `checkAuth` middleware (`middlewares/validar-token.js`) per-route (not globally) — every protected route explicitly lists it, e.g. `routes.get('/', checkAuth, getProducts)`. The login route (`authRouter.js`) is the only unauthenticated one.
- **Auth**: JWT-based. `helpers/generar-jwt.js` signs `{ id }` with `JWT_SECRET`, 5-day expiry. `checkAuth` reads the `Authorization: Bearer <token>` header, verifies it, and attaches `req.usuario` (the full `User` row) for downstream handlers. Passwords are hashed with `bcrypt`.
- Some routes are commented out in the router rather than deleted (e.g. `changeStateTransfer`/`deleteTransfer` in `transferRouter.js`) — check the router file, not just the controller exports, to see what's actually reachable.
- Controller error responses and validation messages are written in Spanish throughout; keep new endpoints consistent with that.

### Inventory domain model

- `Inventory` rows are keyed by `(productId, depositId)` (unique index) and carry `stock`, `stockMin`, `stockOrder`, plus a denormalized `branchId` (redundant with `Deposit.branchId`, kept for direct per-branch queries). Each `Branch` has one or more `Deposit`s, exactly one of which is flagged `main: true` — the "main deposit" is what transfers and low-stock summaries operate against.
- `Equipment`/`BranchEquipment` is a parallel, simpler inventory track for durable goods: `BranchEquipment` is keyed by `(equipmentId, branchId)` (unique index) with a plain `quantity`, no deposit/min/order concept.

### Transfers

`transferControllers.createTransfer` is the one multi-step write path that uses a Sequelize transaction (`sequelize.transaction()`). A single transfer's `details` array can mix product lines and equipment lines (each line has exactly one of `productId`/`equipmentId`, validated up front), but they're processed through separate code paths:
- **Product lines** move `Inventory.stock` between the origin and destination branches' *main deposits* — both branches must have one, and origin must have sufficient stock there.
- **Equipment lines** move `BranchEquipment.quantity` directly between branches (no deposit concept).

Both validate fully before any writes happen; any failure rolls back and returns a 400 with a Spanish user-facing message. On success it creates `Transfer` + one `TransferDetail` row per line (decrementing origin / incrementing-or-creating destination records) atomically.

### Low-stock queries

`getInventorySummaryByBranch` and `getCriticalStock` (`inventoryControllers.js`) aggregate `Inventory.stock` with `SUM` grouped by `productId` — stock lives per-deposit, but thresholds (`belowMin`/`belowOrder`) are compared against the branch's total across deposits, keyed off the main deposit's `stockMin`/`stockOrder`. `getCriticalStock` runs this per-branch in a loop across all active branches and returns a flat, severity-sorted list (lowest `totalStock`/`stockMin` ratio first).
