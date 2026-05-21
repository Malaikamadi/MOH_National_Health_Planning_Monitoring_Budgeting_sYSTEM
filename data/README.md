# Data

Reference data, seeds, and one-time migration scripts from the legacy
Excel environment.

```
data/
├── seed/             # Idempotent seed scripts run after migrations
│   ├── 01_directorates.py   (TODO)
│   ├── 02_districts_facilities.py (TODO)
│   ├── 03_indicators.py     (TODO)
│   └── 04_demo_users.py     (TODO)
├── migrations/       # Legacy Excel → NHPMBR data ingestion scripts (TODO)
└── README.md
```

The Phase-0 deliverable is to populate `seed/` with idempotent scripts
that produce the demo dataset described in `docs/05-mvp-scope.md §9`:

- 14 directorates with realistic codes
- ~40 programmes
- 1 strategic plan with 5 pillars and 25 objectives
- 16 districts, ~150 chiefdoms, ~1,300 facilities (real geocoordinates from MFL)
- 50 core indicators
- 25 demo users across the role matrix
