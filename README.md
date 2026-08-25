# Aside — Server

REST API for **Aside**, a cohort knowledge library. Node, Express 5, MongoDB, Mongoose.

**Live API:** `https://aside-server.onrender.com/api`
**Live app:** https://aside-client.vercel.app
**Frontend repo:** https://github.com/aliihsaad/aside-client

> Render free tier — the first request after idle takes ~40 seconds to wake.

---

## What it is

A cohort keeps two kinds of knowledge: the conversation, and the artifacts. Aside
holds both. Posts are the feed; resources are the library. A resource belongs to a
person first, sits on their shelf, and can be forked by anyone who wants their own
version — with the lineage preserved.

---

## Stack

Node 20+ · Express 5 · MongoDB Atlas · Mongoose 9 · JWT · bcrypt · Cloudinary · multer · ESM

ESM throughout (`"type": "module"`), so every relative import carries its `.js` extension.

---

## Local setup

```bash
git clone https://github.com/aliihsaad/aside-server.git
cd aside-server && npm install
cp .env.example .env      # then fill it in
npm run dev
```

## Environment

| Variable | Purpose |
|---|---|
| `PORT` | Port to listen on (default 5005) |
| `ORIGIN` | Frontend URL for CORS — no trailing slash |
| `MONGODB_URI` | Atlas connection string, including the database name |
| `TOKEN_SECRET` | Secret for signing JWTs |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

> **One setting lives outside this repo.** Cloudinary blocks PDF and ZIP delivery by
> default on new accounts. Uploads still return `201` with a valid `secure_url`, but
> the URL won't open. Enable it under
> *Cloudinary console → Settings → Security → "Allow delivery of PDF and ZIP files."*

---

## Models

`User` · `Post` · `Folder` · `Resource` · `PostComment` · `ResourceComment` · `Bookmark`

`Resource.forkedFrom` is a self-referencing ObjectId, which is what turns the library
from a list into a graph.

Comments are **two separate models** with ordinary `ref` fields rather than one
polymorphic model. It's more files, but every reference points at a known collection,
`populate` needs no branching, and neither model can be pointed at the wrong thing.

---

## Routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | – | Liveness check |
| POST | `/api/auth/signup` | – | Register |
| POST | `/api/auth/login` | – | Log in |
| GET | `/api/auth/verify` | ✔ | Validate token |
| GET | `/api/users` | ✔ | Directory, `?search=` |
| GET/PUT | `/api/users/me` | ✔ | Own profile |
| GET | `/api/users/:id` | ✔ | A profile |
| GET/POST | `/api/posts` | ✔ | List / create |
| GET/PUT/DELETE | `/api/posts/:id` | ✔ | Read / update / delete |
| GET/POST | `/api/post-comments` | ✔ | `?post=<id>` |
| PUT/DELETE | `/api/post-comments/:id` | ✔ | Update / delete |
| GET/POST | `/api/resource-comments` | ✔ | `?resource=<id>` |
| PUT/DELETE | `/api/resource-comments/:id` | ✔ | Update / delete |
| POST | `/api/folders` | ✔ | Create |
| GET | `/api/folders/user/:userId` | ✔ | A user's shelves |
| GET | `/api/folders/:id` | ✔ | One folder |
| PUT/DELETE | `/api/folders/:id` | ✔ | Update / delete |
| GET | `/api/resources` | ✔ | Search `?q=`, filter `?owner=` `?folder=` `?category=` `?tag=`, order `?sort=` |
| POST | `/api/resources` | ✔ | Create |
| GET | `/api/resources/:id` | ✔ | Detail |
| PUT/DELETE | `/api/resources/:id` | ✔ | Update / delete |
| POST | `/api/resources/:id/fork` | ✔ | Fork to your own shelf |
| GET | `/api/resources/:id/lineage` | ✔ | A resource and its direct forks |
| POST | `/api/bookmarks` | ✔ | Save |
| GET | `/api/bookmarks/me` | ✔ | Saved list |
| DELETE | `/api/bookmarks/:resourceId` | ✔ | Unsave |
| POST | `/api/upload` | ✔ | `multipart/form-data`, field `file` → returns `{ url }` |

Apart from signup, login and the health check, every route requires a token — there
is no logged-out content surface.

`/api/upload` accepts PNG, JPEG, WebP, GIF and PDF up to 5 MB. Files are held in
memory and streamed straight to Cloudinary; the server stores nothing itself.

---

## Authorization

Resources are `private` (owner only) or `cohort` (visible to any member). There is no
third tier — a two-state model you can explain beats a three-state one you can't.

Every read path runs through a single `visibilityFilter` helper: list, detail, search,
folder contents, profile shelves, fork source, lineage, post attachment, and both
comment endpoints. The permission is part of the query rather than a check afterwards,
so a forbidden document never enters the result set at all.

Search is the case that makes this worth doing. `$text` matches across every resource
in the collection, so a search that filtered afterwards would have already read private
drafts belonging to other people. Combining the two with `$and` means the text query
only ever runs against documents the viewer is allowed to see.

A resource you may not see returns **404, not 403**. A 403 confirms the thing exists,
which is exactly what someone probing IDs wants to learn — and because the rule lives
inside the query, the 404 isn't a cover story. The query genuinely found nothing.

---

## Deleting related data

MongoDB has no cascade delete, so every cleanup is explicit. Three strategies, chosen
by whether the child has a reason to exist on its own:

| Delete | Then | Strategy |
|---|---|---|
| Folder | its resources | **Restrict** — the delete is refused while it holds anything |
| Resource | its forks | **Nullify** — forks survive with `forkedFrom` set to `null` |
| Resource | its comments and bookmarks | **Cascade** — deleted alongside it |
| Post | its comments | **Cascade** — deleted alongside it |

A fork is someone else's work and outlives its origin. A comment on a deleted post
can never be fetched or rendered again.

---

## Status codes

| Code | Used for |
|---|---|
| 200 | Successful GET / PUT / DELETE |
| 201 | Successful POST |
| 400 | Invalid input, failed validation, malformed id |
| 401 | Missing, invalid or expired token; wrong credentials |
| 403 | Authenticated but not the owner |
| 404 | Doesn't exist, or exists and isn't visible to you |
| 409 | Duplicate — taken username, email, or folder name |
| 500 | Unhandled server error |

Errors are thrown as `ApiError` instances carrying a `statusCode`, and one central
handler turns them into responses. Mongoose `ValidationError` and `CastError` become
400s; duplicate-key `11000` becomes a 409.

Express 5 forwards a rejected promise from an `async` handler to that middleware
automatically, so there is no `try/catch` in any controller. Synchronous middleware
still calls `next(err)` itself.

---

## Beyond the curriculum

**Query-level authorization.** The course teaches ownership checks in middleware,
which works for single-document routes but not for lists — you can't filter a result
set after fetching it without having loaded documents the viewer isn't allowed to see.
Here the permission is part of the query, as one `visibilityFilter` helper combined
into every read with `$and` rather than object spread, because two filters that both
carry an `$or` will silently overwrite each other.

*Researched and implemented independently; the query operators themselves are course material.*

---

## Known limitations

- `forkCount` and `bookmarkCount` are denormalized and updated in application code. A
  crash mid-write could desync them; production would reconcile on a schedule.
- The cascade deletes are not wrapped in a transaction, so a failure between the parent
  delete and the child cleanup would leave orphans. They're also not retroactive —
  documents orphaned before the cascade existed are still stored.
- Search uses a single MongoDB text index, so it matches whole stemmed words rather
  than substrings — "auth" won't match "authentication". A collection can only carry
  one text index, so every searchable field lives in that one declaration.
- Forks don't receive upstream changes. Lineage is preserved; synchronisation isn't attempted.
- Uploads are capped at 5 MB on Cloudinary's free tier, and PDF delivery depends on an
  account setting rather than anything in this repo.
- Free-tier cold start of ~40 seconds after idle.
