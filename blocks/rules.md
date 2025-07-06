  Breakpoint Detection Values

  Breakpoint Ranges (in pixels)

  | Breakpoint | Min Width | Max Width | Label       | Description                |
  |------------|-----------|-----------|-------------|----------------------------|
  | xs         | 0px       | 639px     | Mobile      | Very small screens         |
  | sm         | 640px     | 767px     | Small       | Small tablets/large phones |
  | md         | 768px     | 1023px    | Tablet      | Tablets and small laptops  |
  | lg         | 1024px    | 1279px    | Desktop     | Desktop screens            |
  | xl         | 1280px    | 1535px    | Large       | Large desktop screens      |
  | 2xl        | 1536px    | ∞         | Extra Large | Very large screens         |

  Media Query Detection Logic

  The parser detects media queries in both pixels and rem units:

  Rem to Pixel Conversion

  - 1rem = 16px (standard browser default)
  - Examples:
    - 40rem = 640px = sm breakpoint
    - 48rem = 768px = md breakpoint
    - 64rem = 1024px = lg breakpoint

  Min-Width Queries (Desktop-first)

  @media (min-width: 640px) { } → sm
  @media (min-width: 768px) { } → md
  @media (min-width: 1024px) { } → lg
  @media (min-width: 1280px) { } → xl
  @media (min-width: 1536px) { } → 2xl

  Max-Width Queries (Mobile-first)

  @media (max-width: 639px) { } → xs
  @media (max-width: 767px) { } → sm
  @media (max-width: 1023px) { } → md
  @media (max-width: 1279px) { } → lg
  @media (max-width: 1535px) { } → xl