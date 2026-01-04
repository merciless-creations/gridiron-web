# Position Skills Mapping

Defines primary, secondary, and tertiary skills per position based on NFL archetype analysis stats.

**Source**: `mcp-nfl-data/*_archetype_analysis.py` - stats used to define career progression curves

**Rules**:
- All positions have universal attributes: `Strength`, `Speed`, `Agility`, `Toughness`
- Primary skills = core stats tracked in NFL data for that position
- Secondary skills = supporting stats that contribute to performance
- Tertiary skills = situational or minor contributors
- OL positions have minimal skills (no individual NFL data available)

---

## Quarterback (QB)

### NFL Stats Analyzed:
- **Primary**: Passing Yards, Passing TDs, Interceptions, Completions, Attempts
- **Secondary**: Passer Rating, Rushing Yards/TDs

### Skills Mapping:
**Primary Skills**:
- `Passing` - core passing ability
- `Accuracy` - completion percentage
- `ArmStrength` - passing yards, deep ball

**Secondary Skills**:
- `Speed` - rushing yards (mobile QBs)
- `Agility` - elusiveness in pocket
- `Awareness` - reading defenses, avoiding INTs

**Tertiary Skills**:
- `Toughness` - durability, injury resistance

---

## Running Back (RB)

### NFL Stats Analyzed:
- **Primary**: Rushing Yards, Rushing TDs, Yards Per Carry, Carries
- **Secondary**: Receiving Yards, Receiving TDs, Receptions, Targets, Fumbles

### Skills Mapping:
**Primary Skills**:
- `Speed` - rushing yards, breakaway runs
- `Agility` - elusiveness, yards per carry
- `BallCarrying` - fumble avoidance, contact balance

**Secondary Skills**:
- `Catching` - receiving yards/TDs (pass-catching backs)
- `RouteRunning` - targets, separation

**Tertiary Skills**:
- `Strength` - breaking tackles
- `Toughness` - durability, high-volume carries

---

## Wide Receiver (WR)

### NFL Stats Analyzed:
- **Primary**: Receiving Yards, Receiving TDs, Receptions, Targets
- **Secondary**: Fumbles

### Skills Mapping:
**Primary Skills**:
- `Speed` - separation, deep routes
- `Catching` - receptions, contested catches
- `RouteRunning` - targets, separation

**Secondary Skills**:
- `Agility` - route breaks, YAC
- `Jumping` - contested catches, red zone

**Tertiary Skills**:
- `Strength` - breaking tackles after catch
- `Toughness` - over-the-middle catches

---

## Tight End (TE)

### NFL Stats Analyzed:
- **Primary**: Receiving Yards, Receiving TDs, Receptions, Targets
- **Note**: Blocking contribution not captured in available stats

### Skills Mapping:
**Primary Skills**:
- `Catching` - receptions, contested catches
- `RouteRunning` - targets, separation
- `Blocking` - run/pass blocking (no NFL data, but critical)

**Secondary Skills**:
- `Speed` - vertical threat TEs
- `Strength` - blocking, breaking tackles

**Tertiary Skills**:
- `Agility` - route running
- `Toughness` - over-the-middle targets

---

## Offensive Line (C, G, T)

### NFL Stats Analyzed:
- **None** - No individual OL stats available in public NFL data

### Skills Mapping (Best Guess):
**Primary Skills**:
- `Blocking` - core OL responsibility

**Secondary Skills**:
- `Strength` - power in run blocking

**Tertiary Skills**:
- `Agility` - footwork, pass protection

**Note**: Minimal skills exposure since we have no validation data. Can iterate once PFF subscription is active.

---

## Defensive Line (DE, DT, NT)

### NFL Stats Analyzed:
- **Primary**: Sacks, Tackles, Tackles for Loss (TFL), QB Hits, Forced Fumbles (FF)

### Skills Mapping:
**Primary Skills**:
- `Tackling` - tackles, TFL
- `PassRushing` - sacks, QB hits
- `Strength` - power moves, run defense

**Secondary Skills**:
- `Speed` - edge rush (DE)
- `Agility` - spin moves, counter rushes

**Tertiary Skills**:
- `Awareness` - gap discipline
- `Toughness` - durability

---

## Linebacker (LB, ILB, OLB, MLB)

### NFL Stats Analyzed:
- **Primary**: Tackles, Sacks, TFL, Interceptions, Forced Fumbles, Pass Defended (PD)

### Skills Mapping:
**Primary Skills**:
- `Tackling` - tackles, TFL
- `Coverage` - INTs, PD (coverage LBs)
- `Awareness` - reading plays, gap assignments

**Secondary Skills**:
- `PassRushing` - sacks (blitzing LBs)
- `Speed` - sideline-to-sideline pursuit
- `Agility` - change of direction

**Tertiary Skills**:
- `Strength` - shedding blocks
- `Toughness` - durability

---

## Defensive Back (CB, S, SS, FS, DB)

### NFL Stats Analyzed:
- **Primary**: Interceptions (INT), Pass Defended (PD), Tackles, Forced Fumbles (FF)

### Skills Mapping:
**Primary Skills**:
- `Coverage` - INTs, PD, pass breakups
- `Speed` - man coverage, deep ball tracking
- `Agility` - route mirroring, hip fluidity

**Secondary Skills**:
- `Tackling` - run support (S)
- `Awareness` - zone coverage, ball tracking
- `Jumping` - contested catches, deflections

**Tertiary Skills**:
- `Strength` - press coverage
- `Toughness` - durability

---

## Kicker (K)

### NFL Stats Analyzed:
- **Primary**: FG Made/Attempted, PAT Made/Attempted

### Skills Mapping:
**Primary Skills**:
- `KickAccuracy` - FG%, distance-adjusted
- `KickPower` - FG range (50+ yards)

**Secondary Skills**:
- `Awareness` - clutch situations, pressure

**Tertiary Skills**:
- *None specific*

---

## Punter (P)

### NFL Stats Analyzed:
- **Primary**: Punt distance, hang time (not in dataset, inferred from productivity formula)

### Skills Mapping:
**Primary Skills**:
- `KickPower` - punt distance
- `KickAccuracy` - directional punting, coffin corner

**Secondary Skills**:
- `Awareness` - situational punting (pin deep, touchback avoidance)

**Tertiary Skills**:
- *None specific*

---

## Summary Table

| Position | Primary Skills | Secondary Skills | Tertiary Skills |
|----------|---------------|------------------|-----------------|
| **QB** | Passing, Accuracy, ArmStrength | Speed, Agility, Awareness | Toughness |
| **RB** | Speed, Agility, BallCarrying | Catching, RouteRunning | Strength, Toughness |
| **WR** | Speed, Catching, RouteRunning | Agility, Jumping | Strength, Toughness |
| **TE** | Catching, RouteRunning, Blocking | Speed, Strength | Agility, Toughness |
| **C/G/T** | Blocking | Strength | Agility |
| **DL** | Tackling, PassRushing, Strength | Speed, Agility | Awareness, Toughness |
| **LB** | Tackling, Coverage, Awareness | PassRushing, Speed, Agility | Strength, Toughness |
| **DB** | Coverage, Speed, Agility | Tackling, Awareness, Jumping | Strength, Toughness |
| **K** | KickAccuracy, KickPower | Awareness | - |
| **P** | KickPower, KickAccuracy | Awareness | - |

---

## Implementation Notes

1. **Universal Attributes**: All players have `Strength`, `Speed`, `Agility`, `Toughness` exposed
2. **Position-Specific Skills**: Only expose skills relevant to that position
3. **OL Limitation**: Minimal skills until PFF data available for validation
4. **Iteration**: This is v1 - can refine based on simulation results and validation
5. **Engine Integration**: Use this mapping to determine which skills are visible/editable per position in UI

---

## Related Issues

- gridiron#221 - Position Primary/Secondary Skills
- gridiron-meta#38 - Player Progression EPIC
- gridiron#101 - Persist Player Stats to DB
