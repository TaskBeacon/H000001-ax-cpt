# H000001 AX-CPT

HTML/browser preview of the AX-CPT task built with `psyflow-web`.
The within-trial procedure, task rules, timing, weighted condition generation, and instruction text are aligned to the local `T000001-ax-cpt` task; only the block and trial count are shortened for preview use.

## Layout

This task follows the same TAPS-style separation used by `psyflow` tasks:

- `main.ts`: task-level orchestration
- `config/config.yaml`: declarative task config
- `src/run_trial.ts`: trial-level logic

## Run

From [psyflow-web](/e:/xhmhc/TaskBeacon/psyflow-web):

```powershell
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:4173/?task=H000001-ax-cpt
```
