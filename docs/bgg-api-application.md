# BoardGameGeek XML API — Application Form Answers

Draft for https://boardgamegeek.com/xmlapi/apply (see also: Using the XML API)
Last updated: 2026-09-02

---

## 1. Application name

```
Bodowota
```

## 2. Your full legal name

```
Ryohei Kobayashi (小林燎平)
```
> TODO: confirm the romanization you use officially (passport / bank).

## 3. Your organization's name, if applicable

```
N/A — individual developer, not acting on behalf of any organization.
```

## 4. Your organization's website, or yours

```
https://github.com/kobaryo833-maker/bodowota
```

## 5. Your organization's location (City/town)

```
TODO: search and select your city (e.g. "Tokyo, Japan")
```

## 6. Contact email (must be actively monitored)

```
(personal Gmail address — submitted to BGG, deliberately not recorded here)
```
> A personal address, deliberately not an employer address: this project is not connected
> to my employer, and field 3 states that I am not acting on behalf of an organization.
> The literal address is kept out of this public repository; the value BGG has is the one
> in the submitted form.

## 7. Describe your activities as they relate to BoardGameGeek and your use of the XML API

```
I am an individual hobbyist board game player and software developer. I am not acting on
behalf of any organization; Bodowota is a personal side project that I develop and operate
myself.

I own a growing physical board game collection, including games pledged through
crowdfunding platforms, and I currently have no reliable way to keep track of what I own,
what is still in production, and what I have not yet played. I use BoardGameGeek regularly
as my reference source for game information, and I want my app to point users back to BGG
rather than replace it.

I would like to use the XML API strictly to look up metadata for games that a user has
explicitly added to their own collection, and to optionally import a user's own BGG
collection as a starting point. I have no interest in mirroring, bulk-downloading, or
redistributing the BGG database, and I will not expose the API data through any API or
export of my own.
```

## 8. Detailed description of your application(s), and how you will use our API

```
Bodowota is a personal board game collection manager for iOS, currently in development and
not yet released.

Non-technical description:
The user records the board games they physically own. For each game, the app shows basic
information (player count, playing time, year published, publisher, cover image) so the
user can decide what to play or what to bring to a game night, and links back to the game's
page on BoardGameGeek for full details. The app also tracks games the user has pledged on
crowdfunding platforms (via Gamefound's public API), so that pledged-but-not-yet-delivered
games are visible alongside the owned collection. Every request to BGG is triggered by a
deliberate user action: adding a game, or importing their own collection.

Technical description:

[*] Endpoints used: /xmlapi2/thing (game metadata), /xmlapi2/search (so the user can find
the right game when adding it), and /xmlapi2/collection (one-time import of the user's own
collection, at the user's explicit request).

[*] Architecture: the iOS client never talks to the BGG API directly. All BGG requests go
through a small backend service that I operate, which holds the credentials server-side.
No token will ever be embedded in a distributed client binary.

[*] Rate limiting: requests are hard-capped at 1 request per second, issued serially from a
single global queue, with exponential backoff on errors and correct handling of HTTP 202
responses for collection requests.

[*] Caching: game metadata is cached persistently with a long TTL (about 7 days) and served
from cache first, so repeated views of the same game cost zero requests. Because a personal
collection changes rarely, expected real-world volume is on the order of a few dozen
requests per day, with a short burst only during a user's initial collection import.

[*] Attribution: all game data displayed in the app is credited to BoardGameGeek, with
links back to the corresponding BGG pages.

[*] Scope limits: no crawling, no bulk enumeration of IDs, no scraping of HTML pages, and
no re-serving of BGG data to third parties.
```
> BGG uses simple forum formatting; `[*]` inside the textarea's list widget renders as
> bullets. If the editor already gives you a bullet list, paste one bullet per line and
> drop the `[*]` markers.

## 9. Is your application available to the public?

```
Yes
```
> The source repository is public, and the app is intended for public release.

## 10. Your API client(s)

```
Bodowota (iOS app, unreleased)
```
> Comma-separated list field — keep it to names/domains only, not prose. Only one client
> exists, and it reaches BGG through my backend, so there is a single entry. Once the
> backend has a real hostname, this becomes:
> `Bodowota (iOS app), api.bodowota.example` — replace with the actual domain.
> The source repository URL belongs in field 4 (website), not here.

## 11. Is your endeavor commercial in nature?

```
No
```
> True as of today: unreleased, free, no advertising, no paid tier, no revenue of any kind,
> no organization behind it. This answer is only defensible together with the disclosure in
> field 12 — do not delete that paragraph. If you decide to ship advertising or a paid tier,
> contact BGG and re-apply BEFORE launching it, not after.

## 12. Any other information useful in evaluating this request

```
One thing I want to disclose up front. Bodowota is free and has no revenue today, and I
answered "No" to the commercial question on that basis. However, I cannot rule out that
after release I would need to cover server costs, either through an optional paid tier for
convenience features or through advertising. That is not a decision I have made, and it is
not part of the current design, but I would rather mention it now than surprise you later.
If I do go in that direction, I will contact you and re-apply for commercial access before
launching it.

To be explicit about what would not change in that case: BGG data would remain a read-only
reference layer. I would not sell, license, resell, or syndicate BGG data, and I would not
put BGG-derived data behind a paywall. Any paid tier would cover features of my own
(reminders, sync between the user's devices, crowdfunding pledge tracking) rather than
access to BGG content. Attribution and links back to BGG would stay in place regardless.

I have read "Using the XML API" and I will follow the rate limits and terms described
there. If my usage pattern ever causes a problem on your side, please contact me at the
address above and I will fix it immediately.
```
