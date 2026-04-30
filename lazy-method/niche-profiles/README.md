# Niche Profiles

Each `.json` file here describes one niche. The `--init` command lists every file in this folder, so adding a new niche is just dropping a new JSON file.

## Adding a new niche

1. Copy `generic.json` to `{your-niche-slug}.json` (e.g. `saas.json`, `restaurant.json`, `crypto-exchange.json`).
2. Edit the fields:
   - `niche` — slug, must match filename
   - `schema_type` — Schema.org `@type` (e.g. `Organization`, `Restaurant`, `SoftwareApplication`, `LegalService`, `Store`)
   - `is_local` — `true` if there's a physical location / service area; `false` for online-only
   - `required_schemas` — list of Schema.org types every page must include
   - `thresholds_override` — override defaults from `config-template.json` for this niche
   - `required_cta_types` — what kinds of CTAs to enforce (`phone`, `contact_form`, `free_trial`, `book_demo`, `add_to_cart`, etc.)
   - `required_trust_signals` — terms/elements that must appear (`reviews`, `license_number`, `testimonials`, `security_badges`)
   - `psychology_focus` — which psychology levers are appropriate (`expertise`, `social_proof`, `authority`, `urgency_truthful`)
   - `forbidden_psychology` — what NOT to use (`fake_scarcity`, `fake_countdown`, `clickbait`)
3. Save. The next `--init` shows it in the menu.

## Files

- `generic.json` — fallback / starting template, never delete
