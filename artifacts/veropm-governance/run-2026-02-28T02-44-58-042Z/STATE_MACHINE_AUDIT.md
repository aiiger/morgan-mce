# Deterministic Clone Audit

Run: run-2026-02-28T02-44-58-042Z
Terminal State: TERMINAL_BLOCKED_NON_DETERMINISTIC

## Step 1 — States (explicit, implicit, transitional, terminal)
| State ID | Kind | Checkpoint | Entry Condition | Exit Condition | Failure Modes | Recovery Behavior |
|---|---|---|---|---|---|---|
| S000 | implicit_entry | auto-baseline | session established and target page loaded | before auto-tick-1 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S001 | transitional | auto-tick-1 | after auto-baseline | before auto-tick-2 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S002 | transitional | auto-tick-2 | after auto-tick-1 | before auto-tick-3 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S003 | transitional | auto-tick-3 | after auto-tick-2 | before auto-tick-4 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S004 | transitional | auto-tick-4 | after auto-tick-3 | before auto-tick-5 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S005 | transitional | auto-tick-5 | after auto-tick-4 | before auto-tick-6 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S006 | transitional | auto-tick-6 | after auto-tick-5 | before auto-tick-7 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S007 | transitional | auto-tick-7 | after auto-tick-6 | before auto-tick-8 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S008 | transitional | auto-tick-8 | after auto-tick-7 | before auto-tick-9 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S009 | transitional | auto-tick-9 | after auto-tick-8 | before auto-tick-10 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S010 | transitional | auto-tick-10 | after auto-tick-9 | before auto-tick-11 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S011 | transitional | auto-tick-11 | after auto-tick-10 | before auto-tick-12 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S012 | transitional | auto-tick-12 | after auto-tick-11 | before auto-tick-13 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S013 | transitional | auto-tick-13 | after auto-tick-12 | before auto-tick-14 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S014 | transitional | auto-tick-14 | after auto-tick-13 | before auto-tick-15 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S015 | transitional | auto-tick-15 | after auto-tick-14 | before auto-tick-16 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S016 | transitional | auto-tick-16 | after auto-tick-15 | before auto-tick-17 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S017 | transitional | auto-tick-17 | after auto-tick-16 | before auto-tick-18 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S018 | transitional | auto-tick-18 | after auto-tick-17 | before auto-tick-19 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S019 | transitional | auto-tick-19 | after auto-tick-18 | before auto-tick-20 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S020 | transitional | auto-tick-20 | after auto-tick-19 | before auto-tick-21 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S021 | transitional | auto-tick-21 | after auto-tick-20 | before auto-tick-22 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S022 | transitional | auto-tick-22 | after auto-tick-21 | before auto-tick-23 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S023 | transitional | auto-tick-23 | after auto-tick-22 | before auto-tick-24 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S024 | transitional | auto-tick-24 | after auto-tick-23 | before auto-tick-25 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S025 | transitional | auto-tick-25 | after auto-tick-24 | before auto-tick-26 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S026 | transitional | auto-tick-26 | after auto-tick-25 | before auto-tick-27 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S027 | transitional | auto-tick-27 | after auto-tick-26 | before auto-tick-28 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S028 | transitional | auto-tick-28 | after auto-tick-27 | before auto-tick-29 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S029 | transitional | auto-tick-29 | after auto-tick-28 | before auto-tick-30 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S030 | transitional | auto-tick-30 | after auto-tick-29 | before auto-tick-31 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S031 | transitional | auto-tick-31 | after auto-tick-30 | before auto-tick-32 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S032 | transitional | auto-tick-32 | after auto-tick-31 | before auto-tick-33 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S033 | transitional | auto-tick-33 | after auto-tick-32 | before auto-tick-34 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S034 | transitional | auto-tick-34 | after auto-tick-33 | before auto-tick-35 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S035 | transitional | auto-tick-35 | after auto-tick-34 | before auto-tick-36 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S036 | transitional | auto-tick-36 | after auto-tick-35 | before auto-tick-37 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S037 | transitional | auto-tick-37 | after auto-tick-36 | before auto-tick-38 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S038 | transitional | auto-tick-38 | after auto-tick-37 | before auto-tick-39 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S039 | transitional | auto-tick-39 | after auto-tick-38 | before auto-tick-40 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S040 | transitional | auto-tick-40 | after auto-tick-39 | before auto-tick-41 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S041 | transitional | auto-tick-41 | after auto-tick-40 | before auto-tick-42 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S042 | transitional | auto-tick-42 | after auto-tick-41 | before auto-tick-43 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S043 | transitional | auto-tick-43 | after auto-tick-42 | before auto-tick-44 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S044 | transitional | auto-tick-44 | after auto-tick-43 | before auto-tick-45 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S045 | transitional | auto-tick-45 | after auto-tick-44 | before auto-tick-46 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S046 | transitional | auto-tick-46 | after auto-tick-45 | before auto-tick-47 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S047 | transitional | auto-tick-47 | after auto-tick-46 | before auto-tick-48 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S048 | transitional | auto-tick-48 | after auto-tick-47 | before auto-tick-49 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S049 | transitional | auto-tick-49 | after auto-tick-48 | before auto-tick-50 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S050 | transitional | auto-tick-50 | after auto-tick-49 | before auto-tick-51 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S051 | transitional | auto-tick-51 | after auto-tick-50 | before auto-tick-52 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S052 | transitional | auto-tick-52 | after auto-tick-51 | before auto-tick-53 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S053 | transitional | auto-tick-53 | after auto-tick-52 | before auto-tick-54 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S054 | transitional | auto-tick-54 | after auto-tick-53 | before auto-tick-55 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S055 | transitional | auto-tick-55 | after auto-tick-54 | before auto-tick-56 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S056 | transitional | auto-tick-56 | after auto-tick-55 | before auto-tick-57 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S057 | transitional | auto-tick-57 | after auto-tick-56 | before auto-tick-58 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S058 | transitional | auto-tick-58 | after auto-tick-57 | before auto-tick-59 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S059 | transitional | auto-tick-59 | after auto-tick-58 | before auto-tick-60 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S060 | transitional | auto-tick-60 | after auto-tick-59 | before auto-tick-61 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S061 | transitional | auto-tick-61 | after auto-tick-60 | before auto-tick-62 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S062 | transitional | auto-tick-62 | after auto-tick-61 | before auto-tick-63 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S063 | transitional | auto-tick-63 | after auto-tick-62 | before auto-tick-64 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S064 | transitional | auto-tick-64 | after auto-tick-63 | before auto-tick-65 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S065 | transitional | auto-tick-65 | after auto-tick-64 | before auto-tick-66 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S066 | transitional | auto-tick-66 | after auto-tick-65 | before auto-tick-67 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S067 | transitional | auto-tick-67 | after auto-tick-66 | before auto-tick-68 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S068 | transitional | auto-tick-68 | after auto-tick-67 | before auto-tick-69 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S069 | transitional | auto-tick-69 | after auto-tick-68 | before auto-tick-70 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S070 | transitional | auto-tick-70 | after auto-tick-69 | before auto-tick-71 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S071 | transitional | auto-tick-71 | after auto-tick-70 | before auto-tick-72 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S072 | transitional | auto-tick-72 | after auto-tick-71 | before auto-tick-73 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S073 | transitional | auto-tick-73 | after auto-tick-72 | before auto-tick-74 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S074 | transitional | auto-tick-74 | after auto-tick-73 | before auto-tick-75 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S075 | transitional | auto-tick-75 | after auto-tick-74 | before auto-tick-76 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S076 | transitional | auto-tick-76 | after auto-tick-75 | before auto-tick-77 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S077 | transitional | auto-tick-77 | after auto-tick-76 | before auto-tick-78 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S078 | transitional | auto-tick-78 | after auto-tick-77 | before auto-tick-79 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S079 | transitional | auto-tick-79 | after auto-tick-78 | before auto-tick-80 | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S080 | transitional | auto-tick-80 | after auto-tick-79 | before auto-final | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |
| S081 | candidate_terminal | auto-final | after auto-tick-80 | capture ended | snapshot-extraction-failed: page.evaluate: ReferenceError: __name is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:1:17)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) | requires subsequent checkpoint with reduced errors and successful API transitions |

## Step 2 — State Transition Semantics
| Transition ID | From | To | Trigger | Deterministic | Evidence |
|---|---|---|---|---|---|
| T001 | S000 | S001 | auto-tick-1 | false | no-observable-delta; requires API evidence for determinism |
| T002 | S001 | S002 | auto-tick-2 | false | no-observable-delta; requires API evidence for determinism |
| T003 | S002 | S003 | auto-tick-3 | false | no-observable-delta; requires API evidence for determinism |
| T004 | S003 | S004 | auto-tick-4 | false | no-observable-delta; requires API evidence for determinism |
| T005 | S004 | S005 | auto-tick-5 | false | no-observable-delta; requires API evidence for determinism |
| T006 | S005 | S006 | auto-tick-6 | false | no-observable-delta; requires API evidence for determinism |
| T007 | S006 | S007 | auto-tick-7 | false | no-observable-delta; requires API evidence for determinism |
| T008 | S007 | S008 | auto-tick-8 | false | no-observable-delta; requires API evidence for determinism |
| T009 | S008 | S009 | auto-tick-9 | false | no-observable-delta; requires API evidence for determinism |
| T010 | S009 | S010 | auto-tick-10 | false | no-observable-delta; requires API evidence for determinism |
| T011 | S010 | S011 | auto-tick-11 | false | no-observable-delta; requires API evidence for determinism |
| T012 | S011 | S012 | auto-tick-12 | false | no-observable-delta; requires API evidence for determinism |
| T013 | S012 | S013 | auto-tick-13 | false | no-observable-delta; requires API evidence for determinism |
| T014 | S013 | S014 | auto-tick-14 | false | no-observable-delta; requires API evidence for determinism |
| T015 | S014 | S015 | auto-tick-15 | false | no-observable-delta; requires API evidence for determinism |
| T016 | S015 | S016 | auto-tick-16 | false | no-observable-delta; requires API evidence for determinism |
| T017 | S016 | S017 | auto-tick-17 | false | no-observable-delta; requires API evidence for determinism |
| T018 | S017 | S018 | auto-tick-18 | false | no-observable-delta; requires API evidence for determinism |
| T019 | S018 | S019 | auto-tick-19 | false | no-observable-delta; requires API evidence for determinism |
| T020 | S019 | S020 | auto-tick-20 | false | no-observable-delta; requires API evidence for determinism |
| T021 | S020 | S021 | auto-tick-21 | false | no-observable-delta; requires API evidence for determinism |
| T022 | S021 | S022 | auto-tick-22 | false | no-observable-delta; requires API evidence for determinism |
| T023 | S022 | S023 | auto-tick-23 | false | no-observable-delta; requires API evidence for determinism |
| T024 | S023 | S024 | auto-tick-24 | false | no-observable-delta; requires API evidence for determinism |
| T025 | S024 | S025 | auto-tick-25 | false | no-observable-delta; requires API evidence for determinism |
| T026 | S025 | S026 | auto-tick-26 | false | no-observable-delta; requires API evidence for determinism |
| T027 | S026 | S027 | auto-tick-27 | false | no-observable-delta; requires API evidence for determinism |
| T028 | S027 | S028 | auto-tick-28 | false | no-observable-delta; requires API evidence for determinism |
| T029 | S028 | S029 | auto-tick-29 | false | no-observable-delta; requires API evidence for determinism |
| T030 | S029 | S030 | auto-tick-30 | false | no-observable-delta; requires API evidence for determinism |
| T031 | S030 | S031 | auto-tick-31 | false | no-observable-delta; requires API evidence for determinism |
| T032 | S031 | S032 | auto-tick-32 | false | no-observable-delta; requires API evidence for determinism |
| T033 | S032 | S033 | auto-tick-33 | false | no-observable-delta; requires API evidence for determinism |
| T034 | S033 | S034 | auto-tick-34 | false | no-observable-delta; requires API evidence for determinism |
| T035 | S034 | S035 | auto-tick-35 | false | no-observable-delta; requires API evidence for determinism |
| T036 | S035 | S036 | auto-tick-36 | false | no-observable-delta; requires API evidence for determinism |
| T037 | S036 | S037 | auto-tick-37 | false | no-observable-delta; requires API evidence for determinism |
| T038 | S037 | S038 | auto-tick-38 | false | no-observable-delta; requires API evidence for determinism |
| T039 | S038 | S039 | auto-tick-39 | false | no-observable-delta; requires API evidence for determinism |
| T040 | S039 | S040 | auto-tick-40 | false | no-observable-delta; requires API evidence for determinism |
| T041 | S040 | S041 | auto-tick-41 | false | no-observable-delta; requires API evidence for determinism |
| T042 | S041 | S042 | auto-tick-42 | false | no-observable-delta; requires API evidence for determinism |
| T043 | S042 | S043 | auto-tick-43 | false | no-observable-delta; requires API evidence for determinism |
| T044 | S043 | S044 | auto-tick-44 | false | no-observable-delta; requires API evidence for determinism |
| T045 | S044 | S045 | auto-tick-45 | false | no-observable-delta; requires API evidence for determinism |
| T046 | S045 | S046 | auto-tick-46 | false | no-observable-delta; requires API evidence for determinism |
| T047 | S046 | S047 | auto-tick-47 | false | no-observable-delta; requires API evidence for determinism |
| T048 | S047 | S048 | auto-tick-48 | false | no-observable-delta; requires API evidence for determinism |
| T049 | S048 | S049 | auto-tick-49 | false | no-observable-delta; requires API evidence for determinism |
| T050 | S049 | S050 | auto-tick-50 | false | no-observable-delta; requires API evidence for determinism |
| T051 | S050 | S051 | auto-tick-51 | false | no-observable-delta; requires API evidence for determinism |
| T052 | S051 | S052 | auto-tick-52 | false | no-observable-delta; requires API evidence for determinism |
| T053 | S052 | S053 | auto-tick-53 | false | no-observable-delta; requires API evidence for determinism |
| T054 | S053 | S054 | auto-tick-54 | false | no-observable-delta; requires API evidence for determinism |
| T055 | S054 | S055 | auto-tick-55 | false | no-observable-delta; requires API evidence for determinism |
| T056 | S055 | S056 | auto-tick-56 | false | no-observable-delta; requires API evidence for determinism |
| T057 | S056 | S057 | auto-tick-57 | false | no-observable-delta; requires API evidence for determinism |
| T058 | S057 | S058 | auto-tick-58 | false | no-observable-delta; requires API evidence for determinism |
| T059 | S058 | S059 | auto-tick-59 | false | no-observable-delta; requires API evidence for determinism |
| T060 | S059 | S060 | auto-tick-60 | false | no-observable-delta; requires API evidence for determinism |
| T061 | S060 | S061 | auto-tick-61 | false | no-observable-delta; requires API evidence for determinism |
| T062 | S061 | S062 | auto-tick-62 | false | no-observable-delta; requires API evidence for determinism |
| T063 | S062 | S063 | auto-tick-63 | false | no-observable-delta; requires API evidence for determinism |
| T064 | S063 | S064 | auto-tick-64 | false | no-observable-delta; requires API evidence for determinism |
| T065 | S064 | S065 | auto-tick-65 | false | no-observable-delta; requires API evidence for determinism |
| T066 | S065 | S066 | auto-tick-66 | false | no-observable-delta; requires API evidence for determinism |
| T067 | S066 | S067 | auto-tick-67 | false | no-observable-delta; requires API evidence for determinism |
| T068 | S067 | S068 | auto-tick-68 | false | no-observable-delta; requires API evidence for determinism |
| T069 | S068 | S069 | auto-tick-69 | false | no-observable-delta; requires API evidence for determinism |
| T070 | S069 | S070 | auto-tick-70 | false | no-observable-delta; requires API evidence for determinism |
| T071 | S070 | S071 | auto-tick-71 | false | no-observable-delta; requires API evidence for determinism |
| T072 | S071 | S072 | auto-tick-72 | false | no-observable-delta; requires API evidence for determinism |
| T073 | S072 | S073 | auto-tick-73 | false | no-observable-delta; requires API evidence for determinism |
| T074 | S073 | S074 | auto-tick-74 | false | no-observable-delta; requires API evidence for determinism |
| T075 | S074 | S075 | auto-tick-75 | false | no-observable-delta; requires API evidence for determinism |
| T076 | S075 | S076 | auto-tick-76 | false | no-observable-delta; requires API evidence for determinism |
| T077 | S076 | S077 | auto-tick-77 | false | no-observable-delta; requires API evidence for determinism |
| T078 | S077 | S078 | auto-tick-78 | false | no-observable-delta; requires API evidence for determinism |
| T079 | S078 | S079 | auto-tick-79 | false | no-observable-delta; requires API evidence for determinism |
| T080 | S079 | S080 | auto-tick-80 | false | no-observable-delta; requires API evidence for determinism |
| T081 | S080 | S081 | auto-final | false | no-observable-delta; requires API evidence for determinism |

## Proposal/Workflow Creation Mechanism
| Event ID | Phase | Method | Status | URL | Rationale |
|---|---|---|---|---|---|
| M003 | failure | GET | 500 | https://apis-veropm.veropm.app/api/v1/project-templates?category=Waterfall&projectType=1&workspaceId=a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde&searchTerm=rf&sortBy=popularity&sortDirection=desc&pageNumber=1&pageSize=20 | API returned non-2xx for entity workflow/proposal path |
| M004 | failure | GET | 500 | https://apis-veropm.veropm.app/api/v1/project-templates?category=Waterfall&projectType=1&workspaceId=a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde&searchTerm=r&sortBy=popularity&sortDirection=desc&pageNumber=1&pageSize=20 | API returned non-2xx for entity workflow/proposal path |
| M005 | failure | GET | 500 | https://apis-veropm.veropm.app/api/v1/project-templates?category=Waterfall&projectType=1&workspaceId=a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde&searchTerm=rfa&sortBy=popularity&sortDirection=desc&pageNumber=1&pageSize=20 | API returned non-2xx for entity workflow/proposal path |
| M006 | failure | GET | 500 | https://apis-veropm.veropm.app/api/v1/project-templates?category=Waterfall&projectType=1&workspaceId=a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde&searchTerm=rfaf&sortBy=popularity&sortDirection=desc&pageNumber=1&pageSize=20 | API returned non-2xx for entity workflow/proposal path |
| M007 | failure | GET | 500 | https://apis-veropm.veropm.app/api/v1/project-templates?category=Waterfall&projectType=1&workspaceId=a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde&searchTerm=rfafa&sortBy=popularity&sortDirection=desc&pageNumber=1&pageSize=20 | API returned non-2xx for entity workflow/proposal path |
| M008 | failure | GET | 500 | https://apis-veropm.veropm.app/api/v1/project-templates?category=Waterfall&projectType=1&workspaceId=a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde&searchTerm=rfafaf&sortBy=popularity&sortDirection=desc&pageNumber=1&pageSize=20 | API returned non-2xx for entity workflow/proposal path |
| M009 | failure | GET | 500 | https://apis-veropm.veropm.app/api/v1/project-templates?category=Waterfall&projectType=1&workspaceId=a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde&searchTerm=rfafafa&sortBy=popularity&sortDirection=desc&pageNumber=1&pageSize=20 | API returned non-2xx for entity workflow/proposal path |
| M013 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M014 | instantiate | POST | 201 | https://apis-veropm.veropm.app/api/v1/project | POST on entity endpoint indicates creation/instantiation |
| M028 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/workflow/workspace/a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde | Read-back request after mutation is used as persistence verification evidence |
| M030 | instantiate | POST | 200 | https://apis-veropm.veropm.app/api/v1/workflow | POST on entity endpoint indicates creation/instantiation |
| M031 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/workflow/workspace/a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde | Read-back request after mutation is used as persistence verification evidence |
| M033 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M035 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/workflow/f7b4cf3b-1304-473c-93c1-c358e01ab2e3/versions | Read-back request after mutation is used as persistence verification evidence |
| M037 | instantiate | POST | 200 | https://apis-veropm.veropm.app/api/v1/automation | POST on entity endpoint indicates creation/instantiation |
| M047 | instantiate | POST | 200 | https://apis-veropm.veropm.app/api/v1/portfolio/9acdbdab-b9ed-4e98-9d04-a1486f92671c/health/recalculate | POST on entity endpoint indicates creation/instantiation |
| M048 | instantiate | POST | 200 | https://apis-veropm.veropm.app/api/v1/portfolio/e634e8c6-bf74-4b73-b1a1-2c080142d1e5/health/recalculate | POST on entity endpoint indicates creation/instantiation |
| M049 | instantiate | POST | 200 | https://apis-veropm.veropm.app/api/v1/portfolio/a9c994e0-47ff-4577-a84b-4af20a5f3a9d/health/recalculate | POST on entity endpoint indicates creation/instantiation |
| M050 | instantiate | POST | 201 | https://apis-veropm.veropm.app/api/v1/portfolio | POST on entity endpoint indicates creation/instantiation |
| M052 | instantiate | POST | 200 | https://apis-veropm.veropm.app/api/v1/portfolio/e634e8c6-bf74-4b73-b1a1-2c080142d1e5/health/recalculate | POST on entity endpoint indicates creation/instantiation |
| M053 | instantiate | POST | 200 | https://apis-veropm.veropm.app/api/v1/portfolio/9acdbdab-b9ed-4e98-9d04-a1486f92671c/health/recalculate | POST on entity endpoint indicates creation/instantiation |
| M054 | instantiate | POST | 200 | https://apis-veropm.veropm.app/api/v1/portfolio/a9c994e0-47ff-4577-a84b-4af20a5f3a9d/health/recalculate | POST on entity endpoint indicates creation/instantiation |
| M055 | instantiate | POST | 200 | https://apis-veropm.veropm.app/api/v1/portfolio/e1077011-3b0b-482a-895c-fec37dadff9f/health/recalculate | POST on entity endpoint indicates creation/instantiation |
| M065 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M069 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M071 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M073 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M075 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M077 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M079 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M081 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M084 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M086 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M088 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M089 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M094 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M096 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M098 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M100 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M102 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M104 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M107 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M109 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M111 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M113 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M115 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M117 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M118 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M121 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M123 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M125 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M128 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M130 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M131 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M134 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M136 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M138 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M140 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M142 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M144 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |
| M146 | verify | GET | 200 | https://apis-veropm.veropm.app/api/v1/approvalworkflow/pending | Read-back request after mutation is used as persistence verification evidence |

## Step 3 — Explicit Assumptions
- No required-field failure checkpoint was captured.
- Expected exactly one instantiation event; observed 11.
- No initialization/defaulting event was provably captured.
- No persistence update event was provably captured.

## Step 4 — Determinism Gate
- No API persistence event was detected after entity creation.
- Implicit assumptions remain. See assumptions list for unresolved semantics.

## Step 5 — Tribal Knowledge Renames
- Bind to Project -> Workflow Scope
- Template Type -> Workflow Instantiation Mode
- Active -> Execution Enabled
- Set as Default -> Default Template Selector
