# SOP: Code Refactoring

**Standard Operating Procedure for refactoring code**

---

## Overview

This SOP defines the structured workflow for refactoring code safely. It emphasizes creating a safety net of tests first, making incremental changes, and continuous verification to prevent breaking existing functionality.

## Objectives

- Improve code quality without changing behavior
- Create comprehensive test coverage before refactoring
- Make incremental, verifiable changes
- Maintain or improve performance
- Reduce technical debt
- Enhance maintainability

## Required Agents

- **PM** (Project Manager) - Planning and approval
- **TA** (Technical Analyst) - Architecture analysis
- **QA** (Quality Assurance) - Safety net creation
- **FE** (UI/UX Engineer) - Refactoring implementation

**Note**: Design agent is not required unless UX structure changes.

## Workflow Steps

### Step 1: Refactoring Scope & Goals
**Agent**: PM (Project Manager)
**Priority**: High
**Estimated Time**: 10-15 minutes

**Inputs**:
- `refactor_request` - Description of what needs refactoring
- `project_context` - Current project state

**Actions**:
1. Understand the refactoring request
2. Define clear scope (what to refactor, what to leave)
3. Identify goals and success criteria
4. Assess risk and impact
5. Determine if refactoring is worth the effort
6. Create phased approach if scope is large
7. Set constraints (time, risk tolerance, etc.)

**Outputs**:
- `refactor_plan` - Detailed refactoring plan
- `success_criteria` - Measurable success criteria

**Validation**:
- Scope is clearly defined
- Goals are specific and measurable
- Risk assessment is complete
- Success criteria are testable

**Success Criteria Examples**:
- Reduce function complexity from 50 to <20
- Improve test coverage from 60% to 80%
- Eliminate code duplication (DRY violations)
- Reduce file size by consolidating modules
- Improve performance by X%

---

### Step 2: Architecture Analysis
**Agent**: TA (Technical Analyst)
**Priority**: High
**Estimated Time**: 15-25 minutes

**Inputs**:
- `refactor_plan` - Plan from PM
- `codebase` - Existing codebase

**Actions**:
1. Analyze current architecture and patterns
2. Identify code smells and anti-patterns
3. Review dependencies and coupling
4. Assess technical debt
5. Propose refactoring approach
6. Design target architecture
7. Identify potential risks
8. Create incremental refactoring steps

**Outputs**:
- `architecture_analysis` - Current state analysis
- `improvement_proposals` - Proposed improvements and approach

**Validation**:
- Current architecture is well-understood
- Code smells are identified
- Target architecture is clear
- Refactoring steps are incremental
- Risks are documented

**Common Code Smells**:
- Long functions (>50 lines)
- Large classes (>300 lines)
- Duplicate code
- Deep nesting (>4 levels)
- Poor naming
- Tight coupling
- God objects
- Feature envy

---

### Step 3: Safety Net Creation
**Agent**: QA (Quality Assurance)
**Priority**: Critical
**Estimated Time**: 20-30 minutes

**Inputs**:
- `architecture_analysis` - Analysis from TA
- `codebase` - Code to be refactored

**Actions**:
1. Measure current test coverage
2. Identify untested code paths
3. Write comprehensive tests for existing behavior
4. Create baseline for performance metrics
5. Document current behavior
6. Ensure all tests pass before refactoring
7. Set up continuous verification

**Outputs**:
- `baseline_tests` - Comprehensive test suite
- `coverage_baseline` - Current coverage metrics

**Validation**:
- Test coverage ≥ 80% for code being refactored
- All tests pass
- Behavior is fully documented
- Performance baseline established

**Safety Net Checklist**:
- [ ] Unit tests for all functions
- [ ] Integration tests for workflows
- [ ] E2E tests for user flows
- [ ] Performance benchmarks
- [ ] All tests passing
- [ ] Coverage ≥ 80%

**CRITICAL**: Do NOT proceed with refactoring until safety net is in place!

---

### Step 4: Incremental Refactoring
**Agent**: FE (UI/UX Engineer)
**Priority**: High
**Estimated Time**: 30-60 minutes

**Inputs**:
- `improvement_proposals` - Refactoring approach from TA
- `baseline_tests` - Test suite from QA

**Actions**:
1. Review refactoring plan and tests
2. Make small, incremental changes
3. Run tests after each change
4. Commit after each successful step
5. Refactor code following target architecture
6. Extract reusable components
7. Simplify complex logic
8. Improve naming and readability

**Outputs**:
- `refactored_code` - Improved, refactored code

**Validation**:
- All tests still pass
- Behavior is unchanged
- Code is more readable and maintainable
- Complexity is reduced
- No new bugs introduced

**Refactoring Techniques**:
- **Extract Function**: Break long functions into smaller ones
- **Extract Variable**: Name complex expressions
- **Rename**: Improve naming for clarity
- **Move**: Organize code logically
- **Inline**: Remove unnecessary indirection
- **Replace Conditional**: Use polymorphism or maps
- **Consolidate**: Merge duplicate code

**Incremental Approach**:
1. Make one small change
2. Run tests → verify all pass
3. Commit
4. Repeat until complete

---

### Step 5: Verification & Performance Check
**Agent**: QA (Quality Assurance)
**Priority**: Critical
**Estimated Time**: 15-20 minutes

**Inputs**:
- `refactored_code` - Refactored code from FE
- `baseline_tests` - Original test suite

**Actions**:
1. Run full test suite
2. Verify all tests pass
3. Check test coverage maintained or improved
4. Measure performance metrics
5. Compare with baseline
6. Test edge cases
7. Verify behavior is identical
8. Check for regressions

**Outputs**:
- `test_results` - Test results after refactoring
- `coverage_report` - Updated coverage report

**Validation**:
- All tests pass (100%)
- Coverage ≥ baseline (ideally improved)
- Performance ≥ baseline (not degraded)
- No regressions detected
- Behavior is identical

**Verification Checklist**:
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Coverage maintained or improved
- [ ] Performance maintained or improved
- [ ] No new linter warnings
- [ ] No new TypeScript errors

---

### Step 6: Final Review & Validation
**Agent**: PM (Project Manager)
**Priority**: High
**Estimated Time**: 10 minutes

**Inputs**:
- `refactored_code` - Refactored code
- `test_results` - Test results from QA
- `success_criteria` - Original success criteria

**Actions**:
1. Review refactored code
2. Verify success criteria are met
3. Check test coverage and results
4. Validate code quality improvements
5. Ensure no regressions
6. Approve or request changes
7. Document improvements

**Outputs**:
- `final_review` - Review summary
- `completion_status` - Approval or rejection

**Validation**:
- All success criteria met
- Code quality improved
- Tests pass with good coverage
- No breaking changes
- Documentation updated

---

## Success Criteria

The refactoring is successful when:

- ✅ All tests pass (100%)
- ✅ Coverage maintained or improved
- ✅ Code complexity reduced
- ✅ Code readability improved
- ✅ Performance maintained or improved
- ✅ No regressions introduced
- ✅ Original success criteria met
- ✅ PM has given approval

## Failure Handling

If refactoring causes issues:

1. **Stop**: Halt refactoring immediately
2. **Revert**: Roll back to last known good state
3. **Analyze**: Understand what went wrong
4. **Re-plan**: Adjust approach
5. **Try Again**: Make smaller, safer changes

**Golden Rule**: If tests fail, revert immediately!

## Time Estimates

| Step | Agent | Estimated Time |
|------|-------|----------------|
| 1. Scope & Goals | PM | 10-15 min |
| 2. Architecture Analysis | TA | 15-25 min |
| 3. Safety Net Creation | QA | 20-30 min |
| 4. Incremental Refactoring | FE | 30-60 min |
| 5. Verification | QA | 15-20 min |
| 6. Final Review | PM | 10 min |

**Total Estimated Time**: 100-160 minutes (1.5-2.5 hours)

**Critical Path**: Steps 1 → 2 → 3 → 4 → 5 → 6 (all sequential)

## Best Practices

### DO:
- ✅ Create safety net (tests) FIRST
- ✅ Make small, incremental changes
- ✅ Run tests after every change
- ✅ Commit frequently
- ✅ Preserve existing behavior
- ✅ Improve readability and maintainability
- ✅ Document significant changes
- ✅ Measure before and after

### DON'T:
- ❌ Refactor without tests
- ❌ Make large, sweeping changes
- ❌ Change behavior while refactoring
- ❌ Add new features during refactoring
- ❌ Skip testing
- ❌ Ignore performance
- ❌ Rush the process
- ❌ Refactor everything at once

## Refactoring Types

### Code-Level Refactoring
- Extract functions
- Rename variables
- Remove duplication
- Simplify conditionals
- Improve naming

### Structural Refactoring
- Reorganize files
- Extract modules
- Consolidate components
- Improve separation of concerns

### Architectural Refactoring
- Change design patterns
- Modify module boundaries
- Update data flows
- Restructure dependencies

## Red-Green-Refactor Cycle

For TDD practitioners:

1. **Red**: Write failing test
2. **Green**: Make it pass (quick & dirty)
3. **Refactor**: Clean up the code
4. **Repeat**: Continue with next feature

## Checkpoints

| Checkpoint | Agent | Criteria |
|------------|-------|----------|
| After Step 1 | PM | Scope and goals approved |
| After Step 2 | TA | Architecture analysis complete |
| After Step 3 | QA | Safety net in place, all tests pass |
| After Step 4 | FE | Each incremental change tested |
| After Step 5 | QA | Verification complete, no regressions |
| After Step 6 | PM | Final approval given |

## When to Refactor

### Good Times to Refactor:
- Before adding new feature to complex code
- When you encounter code smells
- During bug fixes (after fix is verified)
- In dedicated refactoring sprints
- When tests are comprehensive

### Bad Times to Refactor:
- Near a deadline
- Without test coverage
- While debugging
- When requirements are unclear
- In unstable code

## Measuring Improvement

### Code Quality Metrics:
- **Cyclomatic Complexity**: Lower is better (<10 per function)
- **Code Coverage**: Should increase (target 80%+)
- **Code Duplication**: Should decrease (<5%)
- **File Size**: Smaller, focused files
- **Function Length**: Shorter functions (<50 lines)

### Performance Metrics:
- **Execution Time**: Should maintain or improve
- **Memory Usage**: Should not increase significantly
- **Bundle Size**: Should maintain or decrease

## Common Refactoring Patterns

### Extract Function
```typescript
// Before
function processOrder(order) {
  // validate
  if (!order.items || order.items.length === 0) return false
  // calculate
  let total = 0
  for (const item of order.items) total += item.price
  // save
  database.save(order, total)
}

// After
function processOrder(order) {
  if (!isValidOrder(order)) return false
  const total = calculateTotal(order)
  saveOrder(order, total)
}
```

### Replace Conditional with Map
```typescript
// Before
function getStatus(code) {
  if (code === 200) return 'OK'
  if (code === 404) return 'Not Found'
  if (code === 500) return 'Server Error'
}

// After
const STATUS_MAP = {
  200: 'OK',
  404: 'Not Found',
  500: 'Server Error',
}

function getStatus(code) {
  return STATUS_MAP[code] || 'Unknown'
}
```

---

**Remember**: Refactoring is about improving code quality without changing behavior. Always test first, change incrementally, and verify continuously.
